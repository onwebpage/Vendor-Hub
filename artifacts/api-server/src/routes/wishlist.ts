import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable, productsTable, vendorsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const items = await db.select({
    id: wishlistTable.id,
    productId: wishlistTable.productId,
    addedAt: wishlistTable.createdAt,
    productName: productsTable.name,
    productImages: productsTable.images,
    price: productsTable.price,
    vendorName: vendorsTable.businessName,
  }).from(wishlistTable)
    .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(wishlistTable.userId, userId));
  return res.json(items.map(i => ({ ...i, price: Number(i.price) })));
});

router.post("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const { productId } = req.body;
  const [existing] = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, productId)));
  if (existing) return res.json(existing);
  const [item] = await db.insert(wishlistTable).values({ userId, productId }).returning();
  return res.json(item);
});

router.delete("/:productId", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, Number(req.params.productId))));
  return res.json({ message: "Removed from wishlist" });
});

export default router;
