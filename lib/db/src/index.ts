import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function getPoolConfig(): pg.PoolConfig {
  if (process.env.PGHOST) {
    return {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || "5432"),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: false,
    };
  }
  if (process.env.DATABASE_URL && isValidUrl(process.env.DATABASE_URL)) {
    return { connectionString: process.env.DATABASE_URL };
  }
  if (process.env.SUPABASE_DB_URL && isValidUrl(process.env.SUPABASE_DB_URL)) {
    return {
      connectionString: process.env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  throw new Error(
    "PGHOST, DATABASE_URL, or SUPABASE_DB_URL must be set.",
  );
}

export const pool = new Pool(getPoolConfig());
export const db = drizzle(pool, { schema });

export * from "./schema";
