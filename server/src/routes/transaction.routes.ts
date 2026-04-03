import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getTransactionsHandler } from "../controllers/transaction.controller";

const router = Router();

router.get("/", authMiddleware, getTransactionsHandler);

export { router as transactionRouter };
