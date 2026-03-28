import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";

const router = Router();

router.post("/validate", async (req, res) => {
  const { code, orderAmount } = req.body;
  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code.toUpperCase()));
  if (!coupon || !coupon.isActive) {
    return res.json({ valid: false, message: "Invalid coupon code" });
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return res.json({ valid: false, message: "Coupon has expired" });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return res.json({ valid: false, message: "Coupon usage limit reached" });
  }
  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    return res.json({ valid: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  return res.json({ valid: true, discountAmount, coupon: { ...coupon, discountValue: Number(coupon.discountValue) } });
});

export default router;
