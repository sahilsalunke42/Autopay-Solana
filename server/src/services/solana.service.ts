import bs58 from "bs58";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { solanaConnection } from "../config/solana";
import { decrypt } from "./encryption.service";

type ExecutePaymentInput = {
  encryptedPrivateKey: string;
  receiverAddress: string;
  amountSol: number;
};

function parseSecretKey(privateKeyInput: string): Uint8Array {
  const trimmed = privateKeyInput.trim();

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as number[];
    return Uint8Array.from(parsed);
  }

  return bs58.decode(trimmed);
}

export async function executeSolPayment(input: ExecutePaymentInput): Promise<string> {
  const receiver = new PublicKey(input.receiverAddress);
  const decryptedKey = decrypt(input.encryptedPrivateKey);
  const payer = Keypair.fromSecretKey(parseSecretKey(decryptedKey));

  const lamports = Math.floor(input.amountSol * LAMPORTS_PER_SOL);
  if (!Number.isFinite(lamports) || lamports <= 0) {
    throw new Error("Invalid transfer amount");
  }

  const balance = await solanaConnection.getBalance(payer.publicKey, "confirmed");
  if (balance < lamports) {
    throw new Error("Insufficient wallet balance");
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiver,
      lamports,
    }),
  );

  return sendAndConfirmTransaction(solanaConnection, tx, [payer], {
    commitment: "confirmed",
  });
}
