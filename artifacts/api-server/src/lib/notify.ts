import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";

export async function createNotification(params: {
  userId: number;
  title: string;
  message: string;
  type: string;
}) {
  try {
    await db.insert(notificationsTable).values({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      isRead: false,
    });
  } catch {
  }
}
