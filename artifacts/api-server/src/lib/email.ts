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

function otpEmailHtml(otp: string, purpose: "login" | "signup"): string {
  const title = purpose === "signup" ? "Verify Your Email" : "Your Login Verification Code";
  const subtitle =
    purpose === "signup"
      ? "You're almost there! Enter the code below to verify your email and activate your Vendorkart account."
      : "Use the code below to complete your sign-in. This code is valid for 10 minutes.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1d4ed8;border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Vendor<span style="color:#93c5fd;">kart</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:32px 40px;text-align:center;">
                    <p style="margin:0 0 8px;color:#bfdbfe;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">${purpose === "signup" ? "Email Verification" : "Login Verification"}</p>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">${title}</h1>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">${subtitle}</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:8px 0 32px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background:#f0f9ff;border:2px dashed #3b82f6;border-radius:16px;padding:20px 40px;text-align:center;">
                                <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Your verification code</p>
                                <p style="margin:0;color:#1d4ed8;font-size:48px;font-weight:900;letter-spacing:12px;font-variant-numeric:tabular-nums;">${otp}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#fef9c3;border-radius:10px;padding:14px 18px;">
                          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                            &#x23F1; This code <strong>expires in 10 minutes</strong>. If you didn't request this, please ignore this email — your account remains safe.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">Never share this code with anyone — Vendorkart will never ask for your OTP.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">&#169; 2025 Vendorkart &middot; India's #1 B2B Marketplace</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  purpose: "login" | "signup";
}): Promise<boolean> {
  if (!transporter) {
    console.warn("[email] Gmail not configured — OTP not sent, code:", params.otp);
    return false;
  }
  const subject =
    params.purpose === "signup"
      ? "Verify your Vendorkart account"
      : "Your Vendorkart login code";

  try {
    await transporter.sendMail({
      from: `Vendorkart <${GMAIL_USER}>`,
      to: params.to,
      subject,
      html: otpEmailHtml(params.otp, params.purpose),
      text: `Your Vendorkart verification code is: ${params.otp}\n\nThis code expires in 10 minutes. Never share it with anyone.`,
    });
    return true;
  } catch (err) {
    console.error("[email] Failed to send email via Gmail:", err);
    return false;
  }
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!transporter) {
    console.warn("[email] Gmail not configured — email not sent to:", params.to);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `Vendorkart <${GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html ?? `<pre style="font-family:sans-serif">${params.text}</pre>`,
      text: params.text,
    });
    return true;
  } catch {
    return false;
  }
}

export const smtpConfigured = !!(GMAIL_USER && GMAIL_APP_PASSWORD);
