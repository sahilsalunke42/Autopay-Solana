import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { encrypt } from "../services/encryption.service";
import { logger } from "../utils/logger";

const loginSchema = z.object({
  publicKey: z.string().min(32).max(44),
  message: z.string().min(1),
  signature: z.string().min(20),
});

function decodeSignature(rawSignature: string): Uint8Array {
  try {
    return bs58.decode(rawSignature);
  } catch {
    return Uint8Array.from(Buffer.from(rawSignature, "base64"));
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    }

    const { publicKey, message, signature } = parsed.data;
    const pubKey = new PublicKey(publicKey);
    const isValid = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      decodeSignature(signature),
      pubKey.toBytes(),
    );

    if (!isValid) {
      return res.status(401).json({ error: "Invalid wallet signature" });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { publicKey },
      include: { user: true },
    });

    if (!wallet) {
      const created = await prisma.user.create({
        data: {
          wallet: {
            create: {
              publicKey,
              // Create wallet identity first; private key can be linked later via /api/wallet/private-key.
              encryptedPrivateKey: encrypt("__UNLINKED_PRIVATE_KEY__"),
            },
          },
        },
        include: { wallet: true },
      });

      if (!created.wallet) {
        return res.status(500).json({ error: "Failed to create wallet" });
      }

      wallet = {
        ...created.wallet,
        user: created,
      };
    }

    const token = jwt.sign(
      {
        userId: wallet.user.id,
        walletId: wallet.id,
        publicKey: wallet.publicKey,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: {
        id: wallet.user.id,
        walletId: wallet.id,
        publicKey: wallet.publicKey,
      },
    });
  } catch (error) {
    logger.error("Auth login failed", { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Authentication failed" });
  }
}

export async function logOutHandler(req: Request, res: Response) {
  // Logout is stateless in JWT. Client clears token from localStorage.
  // Server simply returns success.
  try {
    return res.json({ message: "Successfully logged out" });
  } catch (error) {
    logger.error("Logout failed", { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Logout failed" });
  }
}