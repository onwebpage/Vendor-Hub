import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_EMAIL = "admin@vendorkart.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function seedAdminUser() {
  try {
    const [existing] = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);

    if (existing) {
      logger.info({ adminUsername: existing.name }, "Admin user already exists");
      return;
    }

    const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
    await db.insert(usersTable).values({
      name: DEFAULT_ADMIN_USERNAME,
      email: DEFAULT_ADMIN_EMAIL,
      role: "admin",
      passwordHash,
    });

    logger.info(
      {
        username: DEFAULT_ADMIN_USERNAME,
        email: DEFAULT_ADMIN_EMAIL,
        defaultPassword: DEFAULT_ADMIN_PASSWORD,
      },
      "✅ Default admin user created — change your password immediately via Admin Settings!",
    );
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}
