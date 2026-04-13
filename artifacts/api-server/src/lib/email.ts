import nodemailer from "nodemailer";

type Transporter = { sendMail: (opts: object) => Promise<void> };
let transporter: Transporter | null | "uninitialized" = "uninitialized";

function getTransporter(): Transporter | null {
  if (transporter !== "uninitialized") return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error(`[Email] Missing credentials — GMAIL_USER: ${user ? "SET" : "NOT SET"}, GMAIL_APP_PASSWORD: ${pass ? "SET" : "NOT SET"}`);
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass: pass.replace(/\s/g, "") },
    connectionTimeout: 15000,
    socketTimeout: 15000,
    greetingTimeout: 15000,
    family: 4,
  });
  console.log(`[Email] Transporter initialized for ${user}`);
  return transporter;
}

export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({ from: `"Vendorkart" <${process.env.GMAIL_USER}>`, ...params });
    console.log(`[Email] Sent to ${params.to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${params.to}:`, err);
    return false;
  }
}

export async function sendOtpEmail(params: { to: string; otp: string; purpose: "login" | "signup" }): Promise<boolean> {
  const isSignup = params.purpose === "signup";
  return sendEmail({
    to: params.to,
    subject: isSignup ? "Verify your Vendorkart account" : "Your Vendorkart login code",
    text: `Your verification code is: ${params.otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#1a1a1a;">${isSignup ? "Verify your account" : "Login verification"}</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;margin:24px 0;">${params.otp}</div>
        <p style="color:#666;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
  });
}
