import { Router } from "express";
import { db } from "@workspace/db";
import { addressesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, userId));
  return res.json(addresses);
});

router.post("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const { name, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;
  if (isDefault) {
    await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.userId, userId));
  }
  const [address] = await db.insert(addressesTable).values({
    userId, name, phone, addressLine1, addressLine2, city, state, pincode, country: country || "India", isDefault: isDefault || false,
  }).returning();
  return res.status(201).json(address);
});

router.delete("/:id", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  await db.delete(addressesTable)
    .where(and(eq(addressesTable.id, Number(req.params.id)), eq(addressesTable.userId, userId)));
  return res.json({ message: "Address deleted" });
});

export default router;
