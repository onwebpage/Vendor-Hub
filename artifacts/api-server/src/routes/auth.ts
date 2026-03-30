import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, authenticate } from "../lib/auth.js";
import { uniqueSlug } from "../lib/slugify.js";
import { logEmail } from "../lib/email-log.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, businessName, businessDescription, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashed = hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name, email, password: hashed, role, phone,
    }).returning();

    if (role === "vendor") {
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

    const token = generateToken(user.id, user.role);
    const { password: _, ...userOut } = user;

    if (role === "vendor") {
      logEmail({
        recipient: email,
        recipientType: "vendor",
        subject: "Welcome to Vendorkart – Registration Received",
        body: `Dear ${name}, thank you for registering as a vendor on Vendorkart. Your account is under review. You'll be notified once approved.`,
        type: "vendor_registered",
        relatedId: user.id,
      });
      logEmail({
        recipient: "admin@vendorkart.in",
        recipientType: "admin",
        subject: `New Vendor Registration – ${businessName || name}`,
        body: `A new vendor "${businessName || name}" (${email}) has registered and is pending approval.`,
        type: "new_vendor_registration",
        relatedId: user.id,
      });
    }

    return res.status(201).json({ user: userOut, token, message: "Registered successfully" });
  } catch (err) {
    req.log.error({ err }, "Register error");
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }
    const token = generateToken(user.id, user.role);
    const { password: _, ...userOut } = user;
    return res.json({ user: userOut, token, message: "Login successful" });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  return res.json({ message: "Logged out successfully" });
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...userOut } = user;
    return res.json(userOut);
  } catch (err) {
    req.log.error({ err }, "Get me error");
    return res.status(500).json({ message: "Failed to get user" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, phone } = req.body;
    const [user] = await db.update(usersTable)
      .set({ name, phone, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...userOut } = user;
    return res.json(userOut);
  } catch (err) {
    req.log.error({ err }, "Update me error");
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.post("/change-password", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== hashPassword(currentPassword)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    await db.update(usersTable)
      .set({ password: hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    return res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;
