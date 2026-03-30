import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db/schema";

export async function logEmail(params: {
  recipient: string;
  recipientType: "customer" | "vendor" | "admin";
  subject: string;
  body: string;
  type: string;
  relatedId?: number;
}) {
  try {
    await db.insert(emailLogsTable).values({
      recipient: params.recipient,
      recipientType: params.recipientType,
      subject: params.subject,
      body: params.body,
      type: params.type,
      status: "sent",
      relatedId: params.relatedId ?? null,
    });
  } catch {
  }
}
