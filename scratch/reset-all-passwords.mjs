import "dotenv/config";
import pg from "pg";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "vendorkart_salt").digest("hex");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Reset these real user accounts to onwebpage@123
const emails = [
  "hamdapply@gmail.com",
  "aliyaanmohd42@gmail.com",
  "subratadebabrata123@gmail.com",
  "replitcomehs@gmail.com",
  "cosingworld@gmail.com",
  "ranikhamar123@gmail.com",
  "debabratabanerjee6789@gmail.com",
  "onwebpage.in@gmail.com",
  "kangnathakur00@gmail.com",
  "vendorkart637@gmail.com",
];

const hashed = hashPassword("onwebpage@123");

for (const email of emails) {
  const res = await client.query(
    "UPDATE users SET password = $1 WHERE email = $2 RETURNING email",
    [hashed, email]
  );
  if (res.rowCount > 0) console.log("✅ Reset:", email);
  else console.log("⚠️  Not found:", email);
}

await client.end();
console.log("\nDone. All passwords set to: onwebpage@123");
