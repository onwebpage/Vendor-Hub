import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, clerkClient } from "../lib/auth.js";
import { uniqueSlug } from "../lib/slugify.js";

const router = Router();

// Called after Clerk signup to sync user into our DB
router.post("/sync", authenticate, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId;
    const { role, businessName, businessDescription, phone } = req.body;

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

    if (!email) return res.status(400).json({ message: "No email found in Clerk account" });

    // Check if already synced
    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
    if (existing.length > 0) {
      const userOut = existing[0];
      return res.json({ user: userOut, message: "Already synced" });
    }

    const userRole = role || "customer";
    const [user] = await db.insert(usersTable).values({
      clerkId: clerkUserId,
      name,
      email,
      role: userRole,
      phone,
    }).returning();

    if (userRole === "vendor") {
      const slug = uniqueSlug(businessName || name);
      await db.insert(vendorsTable).values({
        userId: user.id,
        businessName: businessName || name,
        slug,
        description: businessDescription,
        email,
        phone,
        status: "pending",
      });
    }

    const userOut = user;
    return res.status(201).json({ user: userOut, message: "User synced" });
  } catch (err) {
    req.log.error({ err }, "Sync error");
    return res.status(500).json({ message: "Sync failed" });
  }
});

// Get current user from our DB using Clerk ID
router.get("/me", authenticate, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found. Please complete signup." });
    const userOut = user;
    return res.json(userOut);
  } catch (err) {
    req.log.error({ err }, "Get me error");
    return res.status(500).json({ message: "Failed to get user" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId;
    const { name, phone } = req.body;
    const [user] = await db.update(usersTable)
      .set({ name, phone, updatedAt: new Date() })
      .where(eq(usersTable.clerkId, clerkUserId))
      .returning();
    if (!user) return res.status(404).json({ message: "User not found" });
    const userOut = user;
    return res.json(userOut);
  } catch (err) {
    req.log.error({ err }, "Update me error");
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
