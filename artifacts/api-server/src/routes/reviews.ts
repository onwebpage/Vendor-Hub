import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable, vendorsTable, usersTable } from "@workspace/db/schema";
import { eq, avg, count } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const reviews = await db.select({
      id: reviewsTable.id,
      vendorId: reviewsTable.vendorId,
      customerId: reviewsTable.customerId,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      customerName: usersTable.name,
      customerAvatar: usersTable.avatar,
    }).from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.customerId, usersTable.id))
      .where(eq(reviewsTable.vendorId, Number(req.params.vendorId)));
    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get reviews" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { vendorId, rating, comment } = req.body;
    const [review] = await db.insert(reviewsTable).values({
      vendorId, customerId: userId, rating, comment,
    }).returning();

    const [{ avgRating, cnt }] = await db.select({
      avgRating: avg(reviewsTable.rating),
      cnt: count(),
    }).from(reviewsTable).where(eq(reviewsTable.vendorId, vendorId));

    await db.update(vendorsTable)
      .set({ rating: String(Number(avgRating).toFixed(2)), reviewCount: Number(cnt) })
      .where(eq(vendorsTable.id, vendorId));

    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create review" });
  }
});

export default router;
