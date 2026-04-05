import nacl from "tweetnacl";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
const message = "Sign this message to authenticate with AutoPay.";

const signature = nacl.sign.detached(
  new TextEncoder().encode(message),
  keypair.secretKey,
);

const payload = {
  publicKey: keypair.publicKey.toBase58(),
  message,
  signature: bs58.encode(signature),
  privateKey: bs58.encode(keypair.secretKey),
};

console.log(JSON.stringify(payload, null, 2));
console.log("\nUse this exact JSON as body for POST /auth/login in Postman.");
