import type { Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { prisma } from "../config/db";
import { parseNaturalLanguageTask } from "../services/ai.service";
import { ACTIVE_TASK_STATUS, computeNextExecutionAt, executeTask, pauseTask, resumeTask, deleteTask } from "../services/task.service";
import { logger } from "../utils/logger";

const createTaskByPromptSchema = z.object({
  prompt: z.string().min(5),
  maxAmountLimit: z.number().positive(),
  expiryAt: z.string().datetime().optional(),
});

const createTaskManualSchema = z.object({
  amount: z.number().positive(),
  token: z.string().trim().min(1).transform((value) => value.toUpperCase()),
  receiverAddress: z.string().trim().min(32).max(44),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "every_6_months"]),
  maxAmountLimit: z.number().positive(),
  expiryAt: z.string().datetime().optional(),
});

const createTaskSchema = z.union([createTaskByPromptSchema, createTaskManualSchema]);

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

    const extracted = "prompt" in parsed.data
      ? await parseNaturalLanguageTask(parsed.data.prompt)
      : {
          amount: parsed.data.amount,
          token: parsed.data.token,
          receiverAddress: parsed.data.receiverAddress,
          frequency: parsed.data.frequency,
        };

    if (!extracted) {
      return res.status(400).json({
        error: "Could not parse payment instruction. Try: 'Pay 0.2 SOL monthly to <address>' or 'Pay 0.2 SOL every 6 months to <address>'",
      });
    }

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

    return res.status(201).json({
      task,
      extracted,
      mode: "prompt" in parsed.data ? "nlp" : "manual",
    });
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

export async function pauseTaskHandler(req: Request, res: Response) {
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

    const task = await pauseTask(taskId, authUser.userId);
    return res.json({ task, message: "Task paused successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("does not belong")) {
      return res.status(400).json({ error: message });
    }
    logger.error("Pause task failed", { error: message });
    return res.status(500).json({ error: "Failed to pause task" });
  }
}

export async function resumeTaskHandler(req: Request, res: Response) {
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

    const task = await resumeTask(taskId, authUser.userId);
    return res.json({ task, message: "Task resumed successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("does not belong")) {
      return res.status(400).json({ error: message });
    }
    logger.error("Resume task failed", { error: message });
    return res.status(500).json({ error: "Failed to resume task" });
  }
}

export async function deleteTaskHandler(req: Request, res: Response) {
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

    const task = await deleteTask(taskId, authUser.userId);
    return res.json({ message: "Task deleted successfully", deletedTaskId: task.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("does not belong")) {
      return res.status(400).json({ error: message });
    }
    logger.error("Delete task failed", { error: message });
    return res.status(500).json({ error: "Failed to delete task" });
  }
}
