const { defineConfig } = require("drizzle-kit");
const path = require("path");

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function getDbCredentials() {
  if (process.env.SUPABASE_DB_URL && isValidUrl(process.env.SUPABASE_DB_URL)) {
    return { url: process.env.SUPABASE_DB_URL, ssl: true };
  }
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
    return { url: process.env.DATABASE_URL };
  }
  throw new Error("SUPABASE_DB_URL, PGHOST, or DATABASE_URL must be set");
}

module.exports = defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: getDbCredentials(),
});
