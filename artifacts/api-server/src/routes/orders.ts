import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, addressesTable, usersTable, couponsTable, productsTable, vendorsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { generateOrderNumber } from "../lib/slugify.js";
import { logEmail } from "../lib/email-log.js";
import { createNotification } from "../lib/notify.js";
import { logActivity } from "../lib/activity.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let orders;
    if (userRole === "admin") {
      orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
    } else {
      orders = await db.select().from(ordersTable)
        .where(eq(ordersTable.customerId, userId))
        .orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
    }

    return res.json({ orders, total: orders.length, page });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list orders" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get order" });
  }
});

router.post("/", authenticate, requireRole("customer"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { shippingAddressId, couponCode, notes, paymentScreenshot } = req.body;

    if (!paymentScreenshot) {
      return res.status(400).json({ message: "Payment screenshot is required to place an order" });
    }

    // Use a transaction to ensure all operations succeed or none do
    const result = await db.transaction(async (tx) => {
      const cartItems = await tx.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
      if (cartItems.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const [address] = await tx.select().from(addressesTable).where(eq(addressesTable.id, shippingAddressId));
      if (!address) {
        throw new Error("ADDRESS_NOT_FOUND");
      }

      const orderItems: any[] = [];
      let subtotal = 0;

      for (const item of cartItems) {
        // Replace raw SQL with type-safe Drizzle join
        const [productWithVendor] = await tx
          .select({
            product: productsTable,
            vendorName: vendorsTable.businessName,
          })
          .from(productsTable)
          .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
          .where(eq(productsTable.id, item.productId));

        if (!productWithVendor || !productWithVendor.product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        const product = productWithVendor.product;
        const price = Number(product.price);
        const sub = price * item.quantity;
        subtotal += sub;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          productImage: product.images?.[0] || null,
          vendorId: product.vendorId,
          vendorName: productWithVendor.vendorName || "Unknown Vendor",
          quantity: item.quantity,
          price: price,
          subtotal: sub,
        });
      }

      let discountAmount = 0;
      let resolvedCouponCode: string | null = couponCode || null;

      if (couponCode) {
        const [coupon] = await tx.select().from(couponsTable).where(eq(couponsTable.code, couponCode.toUpperCase()));
        if (
          coupon && 
          coupon.isActive && 
          !(coupon.expiresAt && new Date() > coupon.expiresAt) && 
          !(coupon.maxUses && coupon.usedCount >= coupon.maxUses) && 
          !(coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount))
        ) {
          if (coupon.discountType === "percentage") {
            discountAmount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
          } else {
            discountAmount = Number(coupon.discountValue);
          }
          discountAmount = Math.min(discountAmount, subtotal);
          
          await tx.update(couponsTable)
            .set({ usedCount: (coupon.usedCount || 0) + 1 })
            .where(eq(couponsTable.id, coupon.id));
          
          resolvedCouponCode = coupon.code;
        } else if (couponCode) {
          // If a coupon code was provided but is invalid, we don't throw, just ignore it or could return error
          resolvedCouponCode = null;
        }
      }

      const finalTotal = Math.max(0, subtotal - discountAmount);
      const orderNumber = generateOrderNumber();

      const [newOrder] = await tx.insert(ordersTable).values({
        orderNumber,
        customerId: userId,
        status: "pending_payment",
        paymentStatus: "pending",
        paymentMethod: "upi_qr",
        paymentScreenshot,
        shippingAddress: {
          name: address.name || "",
          phone: address.phone || "",
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country || "India",
        },
        items: orderItems,
        subtotal: String(subtotal),
        discount: String(discountAmount),
        total: String(finalTotal),
        couponCode: resolvedCouponCode,
        notes: notes || "",
      }).returning();

      // Clear cart
      await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

      return { order: newOrder, orderItems };
    });

    const { order, orderItems } = result;

    // Post-order processing (emails, notifications, activity logs)
    // These are outside the transaction as they don't affect DB state if they fail
    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (customer) {
      logEmail({
        recipient: customer.email,
        recipientType: "customer",
        subject: `Order Received – ${order.orderNumber} (Awaiting Payment Verification)`,
        body: `Dear ${customer.name}, your order #${order.orderNumber} has been received. Total: ₹${Number(order.total).toLocaleString("en-IN")}. Your payment screenshot is under review. We will confirm your order once payment is verified.`,
        type: "order_confirmation",
        relatedId: order.id,
      });

      const uniqueVendors = [...new Set(orderItems.map((i: any) => i.vendorId))];
      for (const vendorId of uniqueVendors) {
        logEmail({
          recipient: `vendor-${vendorId}@vendorkart.in`,
          recipientType: "vendor",
          subject: `New Order Received – ${order.orderNumber} (Pending Payment Verification)`,
          body: `You have a new order #${order.orderNumber} awaiting payment verification. Items: ${orderItems.filter((i: any) => i.vendorId === vendorId).map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}. Total: ₹${Number(order.total).toLocaleString("en-IN")}.`,
          type: "new_order_alert",
          relatedId: order.id,
        });
      }
    }

    logActivity({ 
      userId, 
      action: "order_placed", 
      resource: "order", 
      details: `Order ${order.orderNumber} placed via UPI QR. Awaiting payment verification. Total: ₹${Number(order.total).toLocaleString("en-IN")}` 
    });

    return res.status(201).json(order);
  } catch (err: any) {
    req.log.error({ err }, "Order creation failed");

    if (err.message === "CART_EMPTY") {
      return res.status(400).json({ message: "Your cart is empty" });
    }
    if (err.message === "ADDRESS_NOT_FOUND") {
      return res.status(400).json({ message: "Shipping address not found" });
    }
    if (err.message?.startsWith("PRODUCT_NOT_FOUND")) {
      return res.status(400).json({ message: "One or more products in your cart are no longer available" });
    }

    return res.status(500).json({ 
      message: "An internal error occurred while creating your order. Please try again or contact support.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = Number(req.params.id);
    const [order] = await db.update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId))
      .returning();

    const statusLabels: Record<string, string> = {
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    const statusLabel = statusLabels[status] ?? status;

    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
    if (customer) {
      logEmail({
        recipient: customer.email,
        recipientType: "customer",
        subject: `Order ${statusLabel} – ${order.orderNumber}`,
        body: `Dear ${customer.name}, your order #${order.orderNumber} has been updated to: ${statusLabel}.${status === "shipped" ? " Your order is on its way!" : ""}${status === "delivered" ? " Thank you for shopping on Vendorkart!" : ""}`,
        type: `order_${status}`,
        relatedId: order.id,
      });
      createNotification({
        userId: customer.id,
        title: `Order ${statusLabel}`,
        message: `Your order #${order.orderNumber} is now ${statusLabel.toLowerCase()}.`,
        type: `order_${status}`,
      });
    }

    logActivity({ action: "order_status_updated", resource: "order", details: `Order ${order.orderNumber} status changed to: ${status}` });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order" });
  }
});

export default router;
