import { Router } from "express";
import { loginHandler, logOutHandler } from "../controllers/auth.controller";

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
router.post("/login", loginHandler);

/*
	#swagger.tags = ['Auth']
	#swagger.summary = 'Logout (clear session)'
	#swagger.responses[200] = { description: 'Successfully logged out' }
	#swagger.responses[401] = { description: 'Unauthorized' }
*/
router.post("/logout", logOutHandler);

export { router as authRouter };
