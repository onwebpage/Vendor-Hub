import { Router } from "express";
import { db } from "@workspace/db";
import { supportTicketsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";

const router = Router();

router.get("/tickets", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const userRole = (req as any).userRole;
  let tickets;
  if (userRole === "admin") {
    tickets = await db.select().from(supportTicketsTable).orderBy(supportTicketsTable.createdAt);
  } else {
    tickets = await db.select().from(supportTicketsTable)
      .where(eq(supportTicketsTable.userId, userId));
  }
  return res.json(tickets);
});

router.post("/tickets", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const { subject, description, priority } = req.body;
  const [ticket] = await db.insert(supportTicketsTable).values({
    userId, subject, description, priority: priority || "medium",
  }).returning();
  return res.status(201).json(ticket);
});

export default router;
