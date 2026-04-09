import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, authenticate } from "../lib/auth.js";
import { uniqueSlug } from "../lib/slugify.js";
import { logEmail } from "../lib/email-log.js";
import { sendEmail, sendOtpEmail } from "../lib/email.js";
import crypto from "crypto";

const router = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

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

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await db.update(usersTable)
      .set({ twoFactorCode: otp, twoFactorExpiry: expiry })
      .where(eq(usersTable.id, user.id));

    const pendingToken = Buffer.from(JSON.stringify({ pendingUserId: user.id, iat: Date.now() })).toString("base64");
    res.status(201).json({ requiresEmailVerification: true, pendingToken, message: "Check your email for a verification code." });

    sendOtpEmail({ to: email, otp, purpose: "signup" }).then(sent => {
      if (!sent) req.log.info({ otp, userId: user.id }, "Signup OTP email failed or not configured");
    }).catch(err => {
      req.log.error({ err, otp, userId: user.id }, "Signup OTP email error");
    });
    return;
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

    if (user.role !== "admin") {
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      await db.update(usersTable)
        .set({ twoFactorCode: otp, twoFactorExpiry: expiry })
        .where(eq(usersTable.id, user.id));

      const pendingToken = Buffer.from(JSON.stringify({ pendingUserId: user.id, iat: Date.now() })).toString("base64");
      res.json({ requires2FA: true, pendingToken, message: "Verification code sent to your email" });

      sendOtpEmail({ to: user.email, otp, purpose: "login" }).then(sent => {
        if (!sent) req.log.info({ otp, userId: user.id }, "Login OTP email failed or not configured");
      }).catch(err => {
        req.log.error({ err, otp, userId: user.id }, "Login OTP email error");
      });
      return;
    }

    const token = generateToken(user.id, user.role);
    const { password: _, twoFactorCode: __, twoFactorExpiry: ___, ...userOut } = user;
    return res.json({ user: userOut, token, message: "Login successful" });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/verify-2fa", async (req, res) => {
  try {
    const { pendingToken, code } = req.body;
    if (!pendingToken || !code) {
      return res.status(400).json({ message: "Pending token and code are required" });
    }

    let pendingUserId: number;
    try {
      const payload = JSON.parse(Buffer.from(pendingToken, "base64").toString("utf8"));
      pendingUserId = payload.pendingUserId;
      if (!pendingUserId) throw new Error("Invalid token");
    } catch {
      return res.status(400).json({ message: "Invalid pending token" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, pendingUserId)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.twoFactorCode || !user.twoFactorExpiry) {
      return res.status(400).json({ message: "No verification code pending. Please log in again." });
    }
    if (new Date() > user.twoFactorExpiry) {
      return res.status(400).json({ message: "Verification code has expired. Please log in again." });
    }
    if (user.twoFactorCode !== code.trim()) {
      return res.status(401).json({ message: "Invalid verification code." });
    }

    await db.update(usersTable)
      .set({ twoFactorCode: null, twoFactorExpiry: null })
      .where(eq(usersTable.id, user.id));

    const token = generateToken(user.id, user.role);
    const { password: _, twoFactorCode: __, twoFactorExpiry: ___, ...userOut } = user;
    return res.json({ user: userOut, token, message: "Login successful" });
  } catch (err) {
    req.log.error({ err }, "Verify 2FA error");
    return res.status(500).json({ message: "Verification failed" });
  }
});

router.post("/2fa/enable", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    await db.update(usersTable)
      .set({ twoFactorEnabled: true, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
    return res.json({ message: "Two-factor authentication enabled" });
  } catch (err) {
    req.log.error({ err }, "Enable 2FA error");
    return res.status(500).json({ message: "Failed to enable two-factor authentication" });
  }
});

router.post("/2fa/disable", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required to disable 2FA" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await db.update(usersTable)
      .set({ twoFactorEnabled: false, twoFactorCode: null, twoFactorExpiry: null, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
    return res.json({ message: "Two-factor authentication disabled" });
  } catch (err) {
    req.log.error({ err }, "Disable 2FA error");
    return res.status(500).json({ message: "Failed to disable two-factor authentication" });
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
    const { password: _, twoFactorCode: __, twoFactorExpiry: ___, ...userOut } = user;
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
    const { password: _, twoFactorCode: __, twoFactorExpiry: ___, ...userOut } = user;
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
