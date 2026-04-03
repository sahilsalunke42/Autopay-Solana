import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./routes/auth.routes";
import { walletRouter } from "./routes/wallet.routes";
import { taskRouter } from "./routes/task.routes";
import { transactionRouter } from "./routes/transaction.routes";
import { logger } from "./utils/logger";

function loadSwaggerDocument() {
  const docPath = path.resolve(process.cwd(), "swagger-output.json");
  if (!fs.existsSync(docPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(docPath, "utf8"));
  } catch {
    return null;
  }
}

export function createApp() {
  const app = express();
  const swaggerDocument = loadSwaggerDocument();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "autopay-backend" });
  });

  app.get("/docs-json", (_req, res) => {
    if (!swaggerDocument) {
      return res.status(404).json({
        error: "Swagger output not found. Run `bun run swagger:generate` first.",
      });
    }

    return res.json(swaggerDocument);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument ?? { openapi: "3.0.0", paths: {} }));

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
