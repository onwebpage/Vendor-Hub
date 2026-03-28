import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(notificationsTable.createdAt);
  return res.json(notifications);
});

router.put("/:id/read", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, Number(req.params.id)), eq(notificationsTable.userId, userId)));
  return res.json({ message: "Notification marked as read" });
});

export default router;
