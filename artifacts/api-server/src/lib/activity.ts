import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db/schema";

export async function logActivity(params: {
  userId?: number;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await db.insert(activityLogsTable).values({
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch {
  }
}
