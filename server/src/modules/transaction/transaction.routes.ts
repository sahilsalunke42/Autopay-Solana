import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        task: {
          userId: authUser.userId,
        },
      },
      orderBy: { executedAt: "desc" },
    });

    return res.json({ transactions });
  } catch (error) {
    logger.error("Fetch transactions failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export { router as transactionRouter };
