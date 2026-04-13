import nodemailer from "nodemailer";

export interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendViaResend(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const { Resend } = await import("resend");
    const client = new Resend(apiKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "VendorKart <onboarding@resend.dev>";

    const { error } = await client.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html || `<p>${params.text}</p>`,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }

    console.log(`[Email] Sent to ${params.to} via Resend`);
    return true;
  } catch (err) {
    console.error("[Email] Resend exception:", err);
    return false;
  }
}

async function sendViaBrevo(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Vendorkart",
          email:
            process.env.BREVO_SENDER_EMAIL || "noreply@vendorkart.com",
        },
        to: [{ email: params.to }],
        subject: params.subject,
        textContent: params.text,
        htmlContent: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Email] Brevo error ${res.status}:`, err);
      return false;
    }

    console.log(`[Email] Sent to ${params.to} via Brevo`);
    return true;
  } catch (err) {
    console.error("[Email] Brevo exception:", err);
    return false;
  }
}

async function sendViaGmail(params: EmailParams): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return false;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    await transporter.sendMail({
      from: `"VendorKart" <${user}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    console.log(`[Email] Sent to ${params.to} via Gmail`);
    return true;
  } catch (err) {
    console.error("[Email] Gmail exception:", err);
    return false;
  }
}

async function sendViaSMTP(params: EmailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port) : 587,
      secure: port === "465",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"VendorKart" <${user}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    console.log(`[Email] Sent to ${params.to} via SMTP`);
    return true;
  } catch (err) {
    console.error("[Email] SMTP exception:", err);
    return false;
  }
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (await sendViaResend(params)) return true;
  if (await sendViaBrevo(params)) return true;
  if (await sendViaGmail(params)) return true;
  if (await sendViaSMTP(params)) return true;

  console.warn(
    `[Email] All providers failed. Could not send email to ${params.to}.`,
  );
  console.warn(`[Email] Subject: ${params.subject}`);
  console.warn(`[Email] Text: ${params.text}`);
  return false;
}
