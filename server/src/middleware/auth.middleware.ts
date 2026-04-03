import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

type AuthTokenPayload = {
  userId: string;
  walletId: string;
  publicKey: string;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const token = authHeader.slice("Bearer ".length);
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    req.authUser = {
      userId: decoded.userId,
      walletId: decoded.walletId,
      publicKey: decoded.publicKey,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
