const { defineConfig } = require("drizzle-kit");
const path = require("path");

const dbCredentials = process.env.PGHOST
  ? {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || "5432"),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: false,
    }
  : process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : (() => { throw new Error("DATABASE_URL or PG* vars must be set"); })();

module.exports = defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials,
});
