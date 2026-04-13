import "./load-env";
import http from "node:http";
import { pool } from "@workspace/db";
import app, { setupFrontend } from "./app";

import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);

if (process.env["SERVE_FRONTEND"] !== "false") {
  await setupFrontend(httpServer);
}

httpServer.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening on 0.0.0.0");
  logger.info(
    {
      JWT_SECRET: process.env.JWT_SECRET ? "PRESENT" : "MISSING (using dev default) ⚠️",
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "PRESENT" : "MISSING (OTP emails disabled) ⚠️",
    },
    "Auth Config",
  );
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown requested");
  void pool.end().catch(() => undefined);
  httpServer.close((err) => {
    if (err) logger.error({ err }, "HTTP server close error");
    process.exit(err ? 1 : 0);
  });
  setTimeout(() => {
    logger.error("Shutdown timed out; exiting");
    process.exit(1);
  }, 10_000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
