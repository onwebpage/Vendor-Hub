import "dotenv/config";
import pg from "pg";
import crypto from "crypto";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query("SELECT id, email, role, is_active FROM users ORDER BY id DESC LIMIT 20");
console.log("\n=== ALL USERS ===");
console.table(res.rows);

await client.end();
