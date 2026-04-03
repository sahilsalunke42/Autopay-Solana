import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware";
import { prisma } from "../../config/db";
import { encrypt } from "../../services/encryption.service";

const router = Router();

const updatePrivateKeySchema = z.object({
  privateKey: z.string().min(20),
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: authUser.walletId },
      select: {
        id: true,
        publicKey: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.json({ wallet });
  } catch {
    return res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

router.post("/private-key", authMiddleware, async (req, res) => {
  try {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = updatePrivateKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    }

    await prisma.wallet.update({
      where: { id: authUser.walletId },
      data: { encryptedPrivateKey: encrypt(parsed.data.privateKey) },
    });

    return res.json({ message: "Private key updated" });
  } catch {
    return res.status(500).json({ error: "Failed to update private key" });
  }
});

export { router as walletRouter };
