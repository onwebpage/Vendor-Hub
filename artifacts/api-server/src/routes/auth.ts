import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, vendorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../lib/auth.js";
import { signToken } from "../lib/auth.js";
import { generateOtp, setOtp, verifyOtp } from "../lib/otp.js";
import { uniqueSlug } from "../lib/slugify.js";
import { sendEmail } from "../lib/email.js";

const router = Router();

function buildOtpHtml(otp: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 24px;background:#f8f9fa;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:24px;font-weight:bold;color:#1a1a2e;">Vendor<span style="color:#6366f1;">kart</span></span>
      </div>
      <h2 style="color:#1a1a2e;margin:0 0 8px 0;font-size:20px;">Your verification code</h2>
      <p style="color:#555;margin:0 0 28px 0;line-height:1.6;">
        Enter this code to sign in to your VendorKart account. It expires in <strong>10 minutes</strong>.
      </p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#1a1a2e;font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#999;font-size:13px;margin:0;line-height:1.6;">
        If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
      </p>
    </div>
  `;
}

router.post("/send-otp", async (req, res) => {
  try {
    const { email, name, role } = req.body as {
      email?: string;
      name?: string;
      role?: string;
    };
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOtp();
    setOtp(email, otp, name, role);

    const sent = await sendEmail({
      to: email,
      subject: `${otp} is your VendorKart OTP`,
      text: `Your VendorKart verification code is: ${otp}. It expires in 10 minutes.`,
      html: buildOtpHtml(otp),
    });

    if (!sent) {
      console.warn(`[OTP] No email provider configured or all failed. OTP for ${email}: ${otp}`);
      if (process.env.NODE_ENV !== "production") {
        return res.json({ message: `OTP sent (dev mode — check server logs): ${otp}` });
      }
      return res.status(500).json({ message: "Failed to send OTP email. Please check server email configuration." });
    }

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const result = verifyOtp(email, otp);
    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    const entry = result.entry!;
    const emailLower = email.toLowerCase();

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, emailLower))
      .limit(1);

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      const userRole = (entry.role as "customer" | "vendor" | "admin") || "customer";
      const userName = entry.name?.trim() || emailLower.split("@")[0];

      const [newUser] = await db
        .insert(usersTable)
        .values({ name: userName, email: emailLower, role: userRole })
        .returning();
      user = newUser;

      if (userRole === "vendor") {
        const slug = uniqueSlug(userName);
        await db.insert(vendorsTable).values({
          userId: user.id,
          businessName: userName,
          slug,
          email: emailLower,
          status: "pending",
        });
      }
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
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
