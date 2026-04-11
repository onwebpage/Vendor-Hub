import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable, contactInfoTable, socialLinksTable, officeLocationsTable, legalPagesTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/info", async (_req, res) => {
  try {
    const items = await db.select().from(contactInfoTable)
      .where(eq(contactInfoTable.isActive, true))
      .orderBy(sql`${contactInfoTable.sortOrder} ASC`);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch contact info" });
  }
});

router.get("/social-links", async (_req, res) => {
  try {
    const [links] = await db.select().from(socialLinksTable);
    if (!links) return res.json({ facebook: null, twitter: null, instagram: null, linkedin: null, youtube: null, whatsapp: null, pinterest: null, telegram: null });
    return res.json(links);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch social links" });
  }
});

router.get("/office-locations", async (_req, res) => {
  try {
    const locations = await db.select().from(officeLocationsTable)
      .where(eq(officeLocationsTable.isActive, true))
      .orderBy(sql`${officeLocationsTable.sortOrder} ASC`);
    return res.json(locations);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch office locations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const [msg] = await db.insert(contactMessagesTable).values({
      name, email, phone, subject, message, type,
    }).returning();
    return res.status(201).json({ success: true, id: msg.id });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save message" });
  }
});

export default router;
