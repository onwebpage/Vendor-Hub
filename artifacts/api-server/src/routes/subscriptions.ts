import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionPlansTable, vendorSubscriptionsTable, vendorsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { logEmail } from "../lib/email-log.js";

const router = Router();

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
    const [pendingSub] = subs.filter(s => s.status === "pending_verification");

    const sub = activeSub ?? pendingSub;
    if (!sub) return res.status(404).json({ message: "No active subscription" });
    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, sub.planId));
    return res.json({ ...sub, paidAmount: sub.paidAmount ? Number(sub.paidAmount) : null, plan: { ...plan, price: Number(plan.price) } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get subscription" });
  }
});

router.post("/subscribe", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { planId, utrNumber, paidAmount, paymentScreenshot } = req.body;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, planId));
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const isPaid = Number(plan.price) > 0;

    if (isPaid) {
      if (!utrNumber || !String(utrNumber).trim()) {
        return res.status(400).json({ message: "UTR number is required" });
      }
      if (!paidAmount || isNaN(Number(paidAmount)) || Number(paidAmount) <= 0) {
        return res.status(400).json({ message: "Paid amount is required" });
      }
      if (!paymentScreenshot || !String(paymentScreenshot).startsWith("data:image")) {
        return res.status(400).json({ message: "Payment screenshot is required" });
      }

      await db.update(vendorSubscriptionsTable)
        .set({ status: "expired" })
        .where(and(
          eq(vendorSubscriptionsTable.vendorId, vendor.id),
          eq(vendorSubscriptionsTable.status, "active"),
        ));

      const [sub] = await db.insert(vendorSubscriptionsTable).values({
        vendorId: vendor.id,
        planId,
        status: "pending_verification",
        startDate: new Date(),
        autoRenew: false,
        utrNumber: String(utrNumber).trim(),
        paidAmount: String(paidAmount),
        paymentScreenshot: String(paymentScreenshot),
      }).returning();

      logEmail({
        recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
        recipientType: "vendor",
        subject: `Payment Submitted – ${plan.name} Plan`,
        body: `Thank you for submitting your payment for the ${plan.name} plan (UTR: ${utrNumber}). Our team will verify your payment screenshot and activate your plan within 24 hours.`,
        type: "subscription_activated",
        relatedId: sub.id,
      });

      return res.json({ ...sub, paidAmount: Number(sub.paidAmount), plan: { ...plan, price: Number(plan.price) } });
    }

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
