import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db/schema";
import { sendEmail } from "./email.js";

export async function logEmail(params: {
  recipient: string;
  recipientType: "customer" | "vendor" | "admin";
  subject: string;
  body: string;
  type: string;
  relatedId?: number;
}) {
  const sent = await sendEmail({ to: params.recipient, subject: params.subject, text: params.body });
  try {
    await db.insert(emailLogsTable).values({
      recipient: params.recipient,
      recipientType: params.recipientType,
      subject: params.subject,
      body: params.body,
      type: params.type,
      status: sent ? "sent" : "logged",
      relatedId: params.relatedId ?? null,
    });
  } catch {
  }
}
