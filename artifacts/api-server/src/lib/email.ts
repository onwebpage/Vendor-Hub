import { createRequire } from "node:module";

type Transporter = { sendMail: (opts: object) => Promise<void> };

let transporter: Transporter | null | "uninitialized" = "uninitialized";

function getTransporter(): Transporter | null {
  if (transporter !== "uninitialized") return transporter;

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error(`[Email] Missing credentials — GMAIL_USER: ${GMAIL_USER ? "SET" : "NOT SET"}, GMAIL_APP_PASSWORD: ${GMAIL_APP_PASSWORD ? "SET" : "NOT SET"}`);
    transporter = null;
    return null;
  }

  try {
    const _require = createRequire(import.meta.url);
    const nodemailer = _require("nodemailer");
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""),
      },
      connectionTimeout: 15000,
      socketTimeout: 15000,
      greetingTimeout: 15000,
      family: 4,
    });
    console.log(`[Email] Transporter initialized for ${GMAIL_USER}`);
    return transporter;
  } catch (err) {
    console.error("[Email] Failed to initialize transporter:", err);
    transporter = null;
    return null;
  }
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.error("[Email] Cannot send email — transporter not initialized");
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.GMAIL_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`[Email] Successfully sent to ${params.to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${params.to}:`, err);
    return false;
  }
}

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  purpose: "login" | "signup";
}): Promise<boolean> {
  const isSignup = params.purpose === "signup";
  const subject = isSignup
    ? "Verify your Vendorkart account"
    : "Your Vendorkart login code";
  const text = isSignup
    ? `Your Vendorkart verification code is: ${params.otp}\n\nThis code expires in 10 minutes.`
    : `Your Vendorkart login verification code is: ${params.otp}\n\nThis code expires in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">${isSignup ? "Verify your account" : "Login verification"}</h2>
      <p>Your one-time verification code is:</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 24px 0;">${params.otp}</div>
      <p style="color: #666;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  return sendEmail({ to: params.to, subject, text, html });
}
