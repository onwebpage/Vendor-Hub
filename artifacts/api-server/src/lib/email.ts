import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname_lib = path.dirname(fileURLToPath(import.meta.url));
import { config } from "dotenv";
config({ path: path.resolve(__dirname_lib, "../../../../.env") });
import { createRequire } from "node:module";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter: { sendMail: (opts: object) => Promise<void> } | null = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  console.log(`[Email] Initializing SMTP transporter for ${GMAIL_USER} (Port: 465, SSL: true)`);
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
    console.log("[Email] Transporter created successfully");
  } catch (err) {
    console.error("[Email] Failed to initialize transporter:", err);
    transporter = null;
  }
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!transporter) {
    console.error(`[Email] Cannot send email - Transporter not initialized. GMAIL_USER: ${GMAIL_USER}, GMAIL_APP_PASSWORD: ${GMAIL_APP_PASSWORD ? "SET" : "NOT SET"}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: GMAIL_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email successfully sent to ${params.to}`);
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${params.to}:`, err);
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
