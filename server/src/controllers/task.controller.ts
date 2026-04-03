import type { Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { prisma } from "../config/db";
import { parseNaturalLanguageTask } from "../services/ai.service";
import { ACTIVE_TASK_STATUS, computeNextExecutionAt, executeTask } from "../services/task.service";
import { logger } from "../utils/logger";

const createTaskSchema = z.object({
  prompt: z.string().min(5),
  maxAmountLimit: z.number().positive(),
  expiryAt: z.string().datetime().optional(),
});

export async function createTaskHandler(req: Request, res: Response) {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    }

    const extracted = await parseNaturalLanguageTask(parsed.data.prompt);
    if (extracted.amount > parsed.data.maxAmountLimit) {
      return res.status(400).json({ error: "Task amount exceeds maxAmountLimit" });
    }

    try {
      new PublicKey(extracted.receiverAddress);
    } catch {
      return res.status(400).json({ error: "Invalid receiver wallet address" });
    }

    const nextExecutionAt = computeNextExecutionAt(extracted.frequency);
    const task = await prisma.task.create({
      data: {
        userId: authUser.userId,
        walletId: authUser.walletId,
        amount: extracted.amount,
        token: extracted.token,
        receiverAddress: extracted.receiverAddress,
        frequency: extracted.frequency.toUpperCase(),
        maxAmountLimit: parsed.data.maxAmountLimit,
        expiryAt: parsed.data.expiryAt ? new Date(parsed.data.expiryAt) : null,
        nextExecutionAt,
        status: ACTIVE_TASK_STATUS,
      },
    });

    return res.status(201).json({ task, extracted });
  } catch (error) {
    logger.error("Create task failed", { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to create task" });
  }
}

export async function getTasksHandler(req: Request, res: Response) {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ tasks });
  } catch (error) {
    logger.error("Fetch tasks failed", { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

export async function executeTaskHandler(req: Request, res: Response) {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const taskIdRaw = req.params.id;
    if (!taskIdRaw) {
      return res.status(400).json({ error: "Task id is required" });
    }
    const taskId = Array.isArray(taskIdRaw) ? taskIdRaw[0] : taskIdRaw;
    if (!taskId) {
      return res.status(400).json({ error: "Task id is required" });
    }

    const result = await executeTask(taskId, {
      userId: authUser.userId,
      source: "manual",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error("Manual task execution failed", { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Failed to execute task" });
  }
}
