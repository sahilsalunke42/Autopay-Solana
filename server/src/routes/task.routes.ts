import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createTaskHandler, executeTaskHandler, getTasksHandler } from "../controllers/task.controller";

const router = Router();

router.post("/create", authMiddleware, createTaskHandler);
router.get("/", authMiddleware, getTasksHandler);
router.post("/execute/:id", authMiddleware, executeTaskHandler);

export { router as taskRouter };
