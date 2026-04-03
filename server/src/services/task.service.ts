import { prisma } from "../config/db";
import { executeSolPayment } from "./solana.service";
import { logger } from "../utils/logger";

const ACTIVE_TASK_STATUS = "ACTIVE" as never;
const SUCCESS_TX_STATUS = "SUCCESS" as never;
const FAILED_TX_STATUS = "FAILED" as never;

function toFrequencyLabel(value: string): "daily" | "weekly" {
  const normalized = value.toLowerCase();
  if (normalized === "daily") return "daily";
  if (normalized === "weekly") return "weekly";
  throw new Error("Unsupported frequency. Use DAILY/WEEKLY or daily/weekly.");
}

function isTaskActive(status: string): boolean {
  return status.toLowerCase() === "active";
}

export function computeNextExecutionAt(frequency: string, from = new Date()): Date {
  const next = new Date(from);
  const normalized = toFrequencyLabel(frequency);

  if (normalized === "daily") {
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + 7);
  return next;
}

function assertExecutionGuards(task: {
  status: string;
  amount: number;
  maxAmountLimit: number;
  expiryAt: Date | null;
}) {
  const now = new Date();

  if (!isTaskActive(task.status)) {
    throw new Error("Task is not active");
  }

  if (task.expiryAt && now >= task.expiryAt) {
    throw new Error("Task has expired");
  }

  if (task.amount > task.maxAmountLimit) {
    throw new Error("Task amount exceeds max amount limit");
  }
}

export async function executeTask(taskId: string, options?: { userId?: string; source?: "manual" | "scheduler" }) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      wallet: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (options?.userId && task.userId !== options.userId) {
    throw new Error("Task does not belong to authenticated user");
  }

  assertExecutionGuards(task);

  if (task.token.toUpperCase() !== "SOL") {
    throw new Error("Only SOL transfers are supported in MVP");
  }

  const now = new Date();
  const nextExecutionAt = computeNextExecutionAt(task.frequency, now);

  try {
    const txHash = await executeSolPayment({
      encryptedPrivateKey: task.wallet.encryptedPrivateKey,
      receiverAddress: task.receiverAddress,
      amountSol: task.amount,
    });

    await prisma.transaction.create({
      data: {
        taskId: task.id,
        amount: task.amount,
        txHash,
        status: SUCCESS_TX_STATUS,
      },
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt,
      },
    });

    return { success: true, txHash };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown execution failure";

    await prisma.transaction.create({
      data: {
        taskId: task.id,
        amount: task.amount,
        status: FAILED_TX_STATUS,
        error: errorMessage,
      },
    });

    await prisma.task.update({
      where: { id: task.id },
      data: {
        lastExecutedAt: now,
        nextExecutionAt,
      },
    });

    logger.error("Task execution failed", {
      taskId: task.id,
      source: options?.source ?? "manual",
      error: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
}

export { ACTIVE_TASK_STATUS };
