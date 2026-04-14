import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, signToken } from "../lib/auth.js";
import { uniqueSlug } from "../lib/slugify.js";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailLower = email.trim().toLowerCase();

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, emailLower))
      .limit(1);

    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const userRole = (role as "customer" | "vendor") === "vendor" ? "vendor" : "customer";
    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(usersTable)
      .values({ name: name.trim(), email: emailLower, role: userRole, passwordHash })
      .returning();

    if (userRole === "vendor") {
      const slug = uniqueSlug(name.trim());
      await db.insert(vendorsTable).values({
        userId: newUser.id,
        businessName: name.trim(),
        slug,
        email: emailLower,
        status: "pending",
      });
    }

    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    return res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailLower = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, emailLower))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get user" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { name, phone } = req.body as { name?: string; phone?: string };
    const [user] = await db
      .update(usersTable)
      .set({ name, phone, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
