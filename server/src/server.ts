import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/db";
import { startScheduler } from "./jobs/scheduler.job";
import { logger } from "./utils/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info("Server started", { port: env.PORT, nodeEnv: env.NODE_ENV });
  startScheduler();
});

async function shutdown(signal: string) {
  logger.warn("Shutdown signal received", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
