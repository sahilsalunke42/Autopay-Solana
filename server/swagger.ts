import swaggerAutogen from "swagger-autogen";
import fs from "node:fs";
import path from "node:path";

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
        oneOf: [
          {
            type: "object",
            required: ["prompt", "maxAmountLimit"],
            properties: {
              prompt: { type: "string", example: "Pay 0.2 SOL weekly to 7f3mJQ8Hj9hY7Qm2uQyVJQkM7dq2W3XEjL6sCVf8K9Mb" },
              maxAmountLimit: { type: "number", example: 0.5 },
              expiryAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
            },
          },
          {
            type: "object",
            required: ["amount", "token", "receiverAddress", "frequency", "maxAmountLimit"],
            properties: {
              amount: { type: "number", example: 0.2 },
              token: { type: "string", example: "SOL" },
              receiverAddress: { type: "string", example: "7f3mJQ8Hj9hY7Qm2uQyVJQkM7dq2W3XEjL6sCVf8K9Mb" },
              frequency: { type: "string", enum: ["daily", "weekly"], example: "weekly" },
              maxAmountLimit: { type: "number", example: 0.5 },
              expiryAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
            },
          },
        ],
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

await swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);

const outputPath = path.resolve(process.cwd(), outputFile);
const generated = JSON.parse(fs.readFileSync(outputPath, "utf8")) as Record<string, any>;
const paths = (generated.paths ?? {}) as Record<string, any>;

const withBearer = [{ bearerAuth: [] }];

if (paths["/api/auth/login"]?.post) {
  paths["/api/auth/login"].post.tags = ["Auth"];
  paths["/api/auth/login"].post.summary = "Authenticate wallet (wallet-safe login flow)";
  paths["/api/auth/login"].post.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/LoginRequest" },
      },
    },
  };
}

if (paths["/api/wallet/me"]?.get) {
  paths["/api/wallet/me"].get.tags = ["Wallet"];
  paths["/api/wallet/me"].get.summary = "Get authenticated wallet profile";
  paths["/api/wallet/me"].get.security = withBearer;
}

if (paths["/api/wallet/private-key"]?.post) {
  paths["/api/wallet/private-key"].post.tags = ["Wallet"];
  paths["/api/wallet/private-key"].post.summary = "Update encrypted wallet private key";
  paths["/api/wallet/private-key"].post.security = withBearer;
  paths["/api/wallet/private-key"].post.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/UpdatePrivateKeyRequest" },
      },
    },
  };
}

if (paths["/api/task/create"]?.post) {
  paths["/api/task/create"].post.tags = ["Task"];
  paths["/api/task/create"].post.summary = "Create autopay task (manual fields or natural language)";
  paths["/api/task/create"].post.security = withBearer;
  paths["/api/task/create"].post.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/CreateTaskRequest" },
      },
    },
  };
}

if (paths["/api/task/"]?.get) {
  paths["/api/task/"].get.tags = ["Task"];
  paths["/api/task/"].get.summary = "Get all tasks for authenticated user";
  paths["/api/task/"].get.security = withBearer;
}

if (paths["/api/task/execute/{id}"]?.post) {
  paths["/api/task/execute/{id}"].post.tags = ["Task"];
  paths["/api/task/execute/{id}"].post.summary = "Manually execute a task";
  paths["/api/task/execute/{id}"].post.security = withBearer;
}

if (paths["/api/transaction/"]?.get) {
  paths["/api/transaction/"].get.tags = ["Transaction"];
  paths["/api/transaction/"].get.summary = "Get transaction logs for authenticated user";
  paths["/api/transaction/"].get.security = withBearer;
}

generated.paths = paths;
fs.writeFileSync(outputPath, JSON.stringify(generated, null, 2));

console.log(`Swagger spec generated at ${outputFile}`);
