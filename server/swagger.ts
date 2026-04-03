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
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

await swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
console.log(`Swagger spec generated at ${outputFile}`);
