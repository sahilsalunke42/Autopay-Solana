import cron from "node-cron";
import { prisma } from "../config/db";
import { executeTask } from "../services/task.service";
import { logger } from "../utils/logger";

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) {
    return;
  }

  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const dueTasks = await prisma.task.findMany({
        where: {
          nextExecutionAt: {
            lte: now,
          },
        },
        orderBy: {
          nextExecutionAt: "asc",
        },
      });

      for (const task of dueTasks) {
        if (task.status.toLowerCase() !== "active") {
          continue;
        }

        await executeTask(task.id, { source: "scheduler" });
      }
    } catch (error) {
      logger.error("Scheduler cycle failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  schedulerStarted = true;
  logger.info("Scheduler started", { cron: "* * * * *" });
}
