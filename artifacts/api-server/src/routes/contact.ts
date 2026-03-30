import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db/schema";

const router = Router();

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
