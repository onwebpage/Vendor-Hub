import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, addressesTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { generateOrderNumber } from "../lib/slugify.js";

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
    const { shippingAddressId, couponCode, notes } = req.body;

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
      status: "pending",
      paymentStatus: "pending",
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

    return res.status(201).json(order);
  } catch (err) {
    req.log.error({ err }, "Create order error");
    return res.status(500).json({ message: "Failed to create order" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const [order] = await db.update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order" });
  }
});

export default router;
