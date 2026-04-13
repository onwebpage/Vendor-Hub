import { Router } from "express";
import { sendEmail } from "../lib/email.js";

const router = Router();

// GET /api/debug-email?to=someone@gmail.com
router.get("/debug-email", async (req, res) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const to = (req.query.to as string) || gmailUser;

  const status: Record<string, string> = {
    GMAIL_USER: gmailUser ? `SET (${gmailUser})` : "NOT SET ❌",
    GMAIL_APP_PASSWORD: gmailPass ? "SET ✅" : "NOT SET ❌",
    sendingTo: to || "none",
    result: "",
  };

  if (!to) {
    status.result = "No recipient — pass ?to=email@example.com";
    return res.json(status);
  }

  const sent = await sendEmail({
    to,
    subject: "Vendorkart Email Test",
    text: "This is a test email from Vendorkart. If you received this, email sending is working correctly.",
    html: "<p>This is a test email from <strong>Vendorkart</strong>. Email sending is working ✅</p>",
  });

  status.result = sent ? "Email sent successfully ✅" : "Email FAILED ❌ — check Render logs";
  return res.json(status);
});

export default router;
