import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Solana AutoPay Agent API",
    description: "API docs for auth, wallets, tasks, transactions, and scheduler-driven execution.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Wallet" },
    { name: "Task" },
    { name: "Transaction" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["publicKey", "message", "signature"],
        properties: {
          publicKey: { type: "string", example: "7f3mJQ8Hj9hY7Qm2uQyVJQkM7dq2W3XEjL6sCVf8K9Mb" },
          message: { type: "string", example: "Sign this message to authenticate with AutoPay." },
          signature: { type: "string", example: "5zUj...base58-or-base64-signature...3m9" },
          privateKey: { type: "string", example: "optional-wallet-secret-for-first-link" },
        },
      },
      UpdatePrivateKeyRequest: {
        type: "object",
        required: ["privateKey"],
        properties: {
          privateKey: { type: "string", example: "wallet-secret-key" },
        },
      },
      CreateTaskRequest: {
        type: "object",
        required: ["prompt", "maxAmountLimit"],
        properties: {
          prompt: { type: "string", example: "Pay 0.2 SOL weekly to 7f3mJQ8Hj9hY7Qm2uQyVJQkM7dq2W3XEjL6sCVf8K9Mb" },
          maxAmountLimit: { type: "number", example: 0.5 },
          expiryAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
        },
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

await swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
console.log(`Swagger spec generated at ${outputFile}`);
