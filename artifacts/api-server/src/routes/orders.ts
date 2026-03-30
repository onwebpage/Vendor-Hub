import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, addressesTable, usersTable } from "@workspace/db/schema";
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

    const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const [address] = await db.select().from(addressesTable).where(eq(addressesTable.id, shippingAddressId));
    if (!address) return res.status(400).json({ message: "Address not found" });

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const [p] = await db.execute<any>(
        `SELECT p.*, v.business_name as vendor_name FROM products p 
         LEFT JOIN vendors v ON p.vendor_id = v.id 
         WHERE p.id = ${item.productId}`
      );
      if (p && p.rows?.[0]) {
        const row = p.rows[0];
        const price = Number(row.price);
        const sub = price * item.quantity;
        subtotal += sub;
        orderItems.push({
          productId: item.productId,
          productName: row.name,
          productImage: row.images?.[0],
          vendorId: row.vendor_id,
          vendorName: row.vendor_name,
          quantity: item.quantity,
          price,
          subtotal: sub,
        });
      }
    }

    const orderNumber = generateOrderNumber();
    const [order] = await db.insert(ordersTable).values({
      orderNumber,
      customerId: userId,
      status: "pending_payment",
      paymentStatus: "pending",
      paymentMethod: "upi_qr",
      paymentScreenshot,
      shippingAddress: {
        name: address.name || undefined,
        phone: address.phone || undefined,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || undefined,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || "India",
      },
      items: orderItems,
      subtotal: String(subtotal),
      discount: "0",
      total: String(subtotal),
      couponCode,
      notes,
    }).returning();

    await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

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
      const uniqueVendors = [...new Set(orderItems.map(i => i.vendorId))];
      for (const vendorId of uniqueVendors) {
        logEmail({
          recipient: `vendor-${vendorId}@vendorkart.in`,
          recipientType: "vendor",
          subject: `New Order Received – ${order.orderNumber} (Pending Payment Verification)`,
          body: `You have a new order #${order.orderNumber} awaiting payment verification. Items: ${orderItems.filter(i => i.vendorId === vendorId).map(i => `${i.productName} (x${i.quantity})`).join(", ")}. Total: ₹${Number(order.total).toLocaleString("en-IN")}.`,
          type: "new_order_alert",
          relatedId: order.id,
        });
      }
    }

    logActivity({ userId, action: "order_placed", resource: "order", details: `Order ${order.orderNumber} placed via UPI QR. Awaiting payment verification. Total: ₹${Number(order.total).toLocaleString("en-IN")}` });

    return res.status(201).json(order);
  } catch (err) {
    req.log.error({ err }, "Create order error");
    return res.status(500).json({ message: "Failed to create order" });
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
