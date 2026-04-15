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
      process.env.RESEND_FROM_EMAIL || "VendorKart <noreply@vendorkart.shop>";

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

export function otpEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#18181b;padding:32px 40px;text-align:center;">
          <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Vendor<span style="color:#a78bfa;">kart</span></span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Your sign-in code</h2>
          <p style="margin:0 0 32px;color:#71717a;font-size:15px;line-height:1.5;">Use the code below to sign in to your Vendorkart account. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
            <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#18181b;font-variant-numeric:tabular-nums;">${otp}</span>
          </div>
          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">If you didn't request this code, you can safely ignore this email. Never share this code with anyone.</p>
        </td></tr>
        <tr><td style="background:#f4f4f5;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;">&copy; ${new Date().getFullYear()} Vendorkart. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
