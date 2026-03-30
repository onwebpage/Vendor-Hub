import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionPlansTable, vendorSubscriptionsTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import Razorpay from "razorpay";
import { logEmail } from "../lib/email-log.js";

const router = Router();

const razorpay = process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET })
  : null;

router.get("/plans", async (_req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.isActive, true));
    return res.json(plans.map(p => ({ ...p, price: Number(p.price) })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to list plans" });
  }
});

router.get("/current", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const subs = await db.select().from(vendorSubscriptionsTable)
      .where(eq(vendorSubscriptionsTable.vendorId, vendor.id));
    const [activeSub] = subs.filter(s => s.status === "active");

    if (!activeSub) return res.status(404).json({ message: "No active subscription" });
    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, activeSub.planId));
    return res.json({ ...activeSub, plan: { ...plan, price: Number(plan.price) } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get subscription" });
  }
});

router.post("/create-order", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const { amount, planId } = req.body;
    if (!amount || !planId) return res.status(400).json({ message: "amount and planId are required" });

    if (!razorpay) {
      return res.json({ key: process.env.RAZORPAY_KEY ?? "rzp_test_demo", orderId: `order_demo_${Date.now()}`, amount });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount),
      currency: "INR",
      receipt: `sub_plan_${planId}_${Date.now()}`,
    });

    return res.json({ key: process.env.RAZORPAY_KEY, orderId: order.id, amount: order.amount });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message ?? "Failed to create payment order" });
  }
});

router.post("/subscribe", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { planId } = req.body;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, planId));
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await db.update(vendorSubscriptionsTable)
      .set({ status: "expired" })
      .where(eq(vendorSubscriptionsTable.vendorId, vendor.id));

    const [sub] = await db.insert(vendorSubscriptionsTable).values({
      vendorId: vendor.id,
      planId,
      status: "active",
      startDate: new Date(),
      endDate,
      autoRenew: true,
    }).returning();

    await db.update(vendorsTable)
      .set({ subscriptionPlan: plan.slug as any, updatedAt: new Date() })
      .where(eq(vendorsTable.id, vendor.id));

    logEmail({
      recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
      recipientType: "vendor",
      subject: `Subscription Activated – ${plan.name} Plan`,
      body: `Your ${plan.name} plan is now active until ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Enjoy your benefits!`,
      type: "subscription_activated",
      relatedId: sub.id,
    });

    return res.json({ ...sub, plan: { ...plan, price: Number(plan.price) } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to subscribe" });
  }
});

export default router;
