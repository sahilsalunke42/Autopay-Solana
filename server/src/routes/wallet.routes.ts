import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getWalletMeHandler, updatePrivateKeyHandler } from "../controllers/wallet.controller";

const router = Router();

/*
	#swagger.tags = ['Wallet']
	#swagger.summary = 'Get authenticated wallet profile'
	#swagger.security = [{ "bearerAuth": [] }]
*/
router.get("/me", authMiddleware, getWalletMeHandler);

/*
	#swagger.tags = ['Wallet']
	#swagger.summary = 'Update encrypted wallet private key'
	#swagger.security = [{ "bearerAuth": [] }]
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: { $ref: "#/components/schemas/UpdatePrivateKeyRequest" }
			}
		}
	}
*/
router.post("/private-key", authMiddleware, updatePrivateKeyHandler);

export { router as walletRouter };
