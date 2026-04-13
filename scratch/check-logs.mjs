import "dotenv/config";
import { db } from "@workspace/db";
import { emailLogsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

async function checkLogs() {
  try {
    console.log("Fetching last 5 email logs...");
    const logs = await db.select()
      .from(emailLogsTable)
      .orderBy(desc(emailLogsTable.createdAt))
      .limit(5);

    if (logs.length === 0) {
      console.log("No email logs found.");
    } else {
      logs.forEach(log => {
        console.log(`[${log.createdAt.toISOString()}] To: ${log.recipient}, Subject: ${log.subject}, Status: ${log.status}`);
      });
    }
  } catch (err) {
    console.error("Failed to fetch logs:", err);
  } finally {
    process.exit(0);
  }
}

checkLogs();
