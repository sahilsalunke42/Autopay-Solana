import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getWalletMeHandler, updatePrivateKeyHandler } from "../controllers/wallet.controller";

const router = Router();

router.get("/me", authMiddleware, getWalletMeHandler);
router.post("/private-key", authMiddleware, updatePrivateKeyHandler);

export { router as walletRouter };
