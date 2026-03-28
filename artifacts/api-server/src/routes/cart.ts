import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, vendorsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

async function buildCart(userId: number) {
  const items = await db.select({
    id: cartItemsTable.id,
    productId: cartItemsTable.productId,
    quantity: cartItemsTable.quantity,
    productName: productsTable.name,
    productImage: productsTable.images,
    vendorId: productsTable.vendorId,
    price: productsTable.price,
    moq: productsTable.moq,
    vendorName: vendorsTable.businessName,
  }).from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map(i => ({
    ...i,
    price: Number(i.price),
    productImage: Array.isArray(i.productImage) && i.productImage.length > 0 ? i.productImage[0] : null,
    subtotal: Number(i.price) * i.quantity,
  }));

  const subtotal = cartItems.reduce((acc, i) => acc + i.subtotal, 0);
  return { items: cartItems, subtotal, total: subtotal, itemCount: cartItems.length };
}

router.get("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  return res.json(await buildCart(userId));
});

router.post("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const { productId, quantity } = req.body;
  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  if (existing.length > 0) {
    await db.update(cartItemsTable)
      .set({ quantity: existing[0].quantity + (quantity || 1) })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity: quantity || 1 });
  }
  return res.json(await buildCart(userId));
});

router.put("/:itemId", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const { quantity } = req.body;
  await db.update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.id, Number(req.params.itemId)), eq(cartItemsTable.userId, userId)));
  return res.json(await buildCart(userId));
});

router.delete("/:itemId", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, Number(req.params.itemId)), eq(cartItemsTable.userId, userId)));
  return res.json(await buildCart(userId));
});

router.delete("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  return res.json({ message: "Cart cleared" });
});

export default router;
