import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { walletRouter } from "./modules/wallet/wallet.routes";
import { taskRouter } from "./modules/task/task.routes";
import { transactionRouter } from "./modules/transaction/transaction.routes";
import { logger } from "./utils/logger";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "autopay-backend" });
  });

  app.use("/auth", authRouter);
  app.use("/wallet", walletRouter);
  app.use("/task", taskRouter);
  app.use("/transaction", transactionRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error("Unhandled application error", {
      error: err instanceof Error ? err.message : String(err),
    });

    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
