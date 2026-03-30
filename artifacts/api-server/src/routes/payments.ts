import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

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
