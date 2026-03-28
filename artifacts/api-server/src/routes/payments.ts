import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, ordersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { generateTransactionId } from "../lib/slugify.js";
import crypto from "crypto";

const router = Router();

router.post("/initiate", authenticate, async (req, res) => {
  try {
    const { orderId, amount, currency } = req.body;
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    return res.json({
      sessionId,
      orderId,
      amount,
      currency: currency || "INR",
      status: "created",
      dummyOrderId: `order_${crypto.randomBytes(8).toString("hex")}`,
      expiresAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to initiate payment" });
  }
});

router.post("/confirm", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { sessionId, orderId } = req.body;
    const transactionId = generateTransactionId();

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return res.status(404).json({ message: "Order not found" });

    await db.update(ordersTable)
      .set({ paymentStatus: "paid", status: "confirmed", transactionId, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    await db.insert(paymentsTable).values({
      orderId,
      userId,
      amount: order.total,
      status: "paid",
      transactionId,
      method: "dummy_razorpay",
      sessionId,
    });

    return res.json({
      success: true,
      transactionId,
      orderId,
      amount: Number(order.total),
      message: "Payment successful",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to confirm payment" });
  }
});

router.get("/history", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const payments = await db.select().from(paymentsTable)
      .where(eq(paymentsTable.userId, userId));
    return res.json(payments.map(p => ({ ...p, amount: Number(p.amount) })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to get payment history" });
  }
});

export default router;
