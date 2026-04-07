import { Router } from "express";
import { loginHandler } from "../controllers/auth.controller";

const router = Router();

/*
	#swagger.tags = ['Auth']
	#swagger.summary = 'Authenticate wallet (signup/login merged)'
	#swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: { $ref: "#/components/schemas/LoginRequest" }
			}
		}
	}
	#swagger.responses[200] = { description: 'Authenticated' }
	#swagger.responses[400] = { description: 'Invalid request body' }
	#swagger.responses[401] = { description: 'Invalid wallet signature' }
*/
router.post("/auth/login", loginHandler);

export { router as authRouter };
