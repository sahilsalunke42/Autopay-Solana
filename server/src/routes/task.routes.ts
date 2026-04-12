import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createTaskHandler, executeTaskHandler, getTasksHandler, pauseTaskHandler, resumeTaskHandler, deleteTaskHandler } from "../controllers/task.controller";

const router = Router();

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Create autopay task (manual fields or natural language)'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: { $ref: "#/components/schemas/CreateTaskRequest" }
			}
		}
	}
*/
router.post("/create", authMiddleware, createTaskHandler);

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Get all tasks for authenticated user'
	#swagger.security = [{ "bearerAuth": [] }]
*/
router.get("/", authMiddleware, getTasksHandler);

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Manually execute a task'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.parameters['id'] = {
		in: 'path',
		required: true,
		type: 'string',
		description: 'Task id'
	}
*/
router.post("/execute/:id", authMiddleware, executeTaskHandler);

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Pause a task (stops scheduler execution)'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.parameters['id'] = {
		in: 'path',
		required: true,
		type: 'string',
		description: 'Task id'
	}
*/
router.post("/pause/:id", authMiddleware, pauseTaskHandler);

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Resume a paused task'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.parameters['id'] = {
		in: 'path',
		required: true,
		type: 'string',
		description: 'Task id'
	}
*/
router.post("/resume/:id", authMiddleware, resumeTaskHandler);

/*
	#swagger.tags = ['Task']
	#swagger.summary = 'Delete a task permanently'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.parameters['id'] = {
		in: 'path',
		required: true,
		type: 'string',
		description: 'Task id'
	}
*/
router.delete("/:id", authMiddleware, deleteTaskHandler);

export { router as taskRouter };
