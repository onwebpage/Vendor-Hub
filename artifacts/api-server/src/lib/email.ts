import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = GMAIL_USER && GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""),
      },
      connectionTimeout: 15000,
      socketTimeout: 15000,
    })
  : null;

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!transporter) {
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
    return true;
  } catch {
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
