import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getTransactionsHandler } from "../controllers/transaction.controller";

const router = Router();

/*
	#swagger.tags = ['Transaction']
	#swagger.summary = 'Get transaction logs for authenticated user'
	#swagger.security = [{ "bearerAuth": [] }]
*/
router.get("/", authMiddleware, getTransactionsHandler);

export { router as transactionRouter };
