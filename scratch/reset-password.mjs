import "dotenv/config";
import crypto from "crypto";
import pg from "pg";

const email = "hamdapply@gmail.com";
const newPassword = "onwebpage@123";
const hashed = crypto.createHash("sha256").update(newPassword + "vendorkart_salt").digest("hex");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const result = await client.query(
  "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email",
  [hashed, email]
);

if (result.rowCount === 0) {
  console.log("❌ No user found with email:", email);
} else {
  console.log("✅ Password updated for:", result.rows[0].email, "(id:", result.rows[0].id + ")");
}

await client.end();
