async function sendViaBrevo(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("[Email] BREVO_API_KEY not set");
    return false;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Vendorkart", email: process.env.BREVO_SENDER_EMAIL || "noreply@vendorkart.com" },
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
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  return sendViaBrevo(params);
}


