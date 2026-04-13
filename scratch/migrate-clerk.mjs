import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE");
await client.query("ALTER TABLE users ALTER COLUMN password SET DEFAULT ''");
console.log("✅ clerk_id column added");
await client.end();
