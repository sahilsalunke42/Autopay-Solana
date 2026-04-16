```markdown
# 🚀 AutoSol — Autonomous Payment Engine for Solana

![Status](https://img.shields.io/badge/status-MVP-blue)
![Built With](https://img.shields.io/badge/built%20with-Bun%20%7C%20Express%20%7C%20TypeScript-black)
![Database](https://img.shields.io/badge/database-PostgreSQL%20(Neon)-blue)
![Blockchain](https://img.shields.io/badge/blockchain-Solana-purple)
![License](https://img.shields.io/badge/license-MIT-green)

AutoSol is an AI-powered payment automation layer that transforms crypto wallets into **autonomous financial agents** capable of executing transactions based on predefined rules and natural language instructions.

---

## 🧠 Problem

Crypto wallets today are **passive**:
- Every transaction requires manual approval  
- No support for recurring payments  
- No conditional execution  
- Limited real-world usability  

Meanwhile, traditional finance supports:
- Auto-debit  
- Subscriptions  
- Scheduled transfers  

Crypto lacks this fundamental automation layer.

---

## ⚡ Solution

AutoSol introduces **programmable, autonomous payments on Solana**.

Users can define instructions like:

> “Pay 0.2 SOL weekly to this address”

AutoSol will:
- Parse instructions using AI  
- Store structured payment tasks  
- Execute transactions automatically  
- Log every transaction on-chain  

---

## ✨ Features

- 🔐 Wallet-based authentication (no email/password)
- 🤖 Natural language → structured payment tasks
- ⏱ Automated execution using scheduler
- 📊 Transaction logging with status + tx hash
- 🛡 Safety constraints (limits, expiry, validation)

---

## 🏗 Architecture

```

Frontend (Next.js)
↓
Backend (Bun + Express + TypeScript)
↓
Services (AI + Task Engine + Solana Execution)
↓
PostgreSQL (Neon + Prisma)
↓
Scheduler (Cron)
↓
Solana Blockchain

```

---

## 🛠 Tech Stack

### Backend
- Bun  
- Express.js  
- TypeScript  

### Database
- PostgreSQL (Neon)  
- Prisma ORM  

### Blockchain
- Solana Web3.js  

### AI
- OpenAI API  

### Frontend
- Next.js  
- Tailwind CSS  

### Automation
- node-cron  

---

## 🗄 Database Design

### Entities

- **User** → identity  
- **Wallet** → blockchain interaction  
- **Task** → automation logic  
- **Transaction** → execution history  

### Relationships

```

User → Wallet (1:1)
User → Task (1:N)
Task → Transaction (1:N)

```

---

## 🔁 Workflow

### 1. Authentication
- User connects wallet  
- Signs message  
- Backend verifies + issues JWT  

### 2. Task Creation
- User inputs natural language  
- AI converts → structured data  
- Task stored  

### 3. Execution
- Scheduler runs periodically  
- Executes eligible tasks  

### 4. Logging
- Transaction stored with:
  - txHash  
  - status  
  - timestamp  

---

## 📌 Example

```

Input:
"Pay 0.2 SOL weekly to X"

→ AI parses
→ Task stored
→ Scheduler triggers
→ Transaction executed
→ Result logged

```

---

## 🔐 Security

- Private keys stored in encrypted form (AES)
- Execution constraints:
  - Max amount limit  
  - Fixed receiver  
  - Expiry time  

> Note: This is an MVP. Advanced security (delegation, smart contracts) is planned.

---

## 📸 Screenshots

### Landing Page
![Landing](./assets/landing.png)

### Dashboard
![Dashboard](./assets/dashboard.png)

### Task Creation
![Create Task](./assets/create-task.png)

### Transactions
![Transactions](./assets/transactions.png)

> Replace images in `/assets` folder with your actual screenshots.

---

## ⚙️ Setup

### 1. Install dependencies
```bash
bun install
```

### 2. Environment variables

Create `.env`:

```
DATABASE_URL=
ENCRYPTION_KEY=
SOLANA_RPC_URL=
OPENAI_API_KEY=
```

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Start server

```bash
bun run dev
```

---

## 🎯 Demo Flow

1. Connect wallet
2. Create task using natural language
3. View tasks
4. Execute manually
5. Observe automated execution

---

## 🚀 Use Cases

* Subscription payments
* Freelance payouts
* DAO treasury automation
* Recurring transfers
* Conditional payments

---

## ⚠️ Limitations

* Encrypted private key storage (MVP only)
* No smart contract automation
* Limited condition types (time-based)

---

## 🔮 Future Scope

* Delegated wallet permissions (session keys)
* Multi-wallet support
* Event-based triggers
* Smart contract execution
* Notifications

---

## 🧭 Vision

AutoSol shifts crypto from:

> Manual transaction systems

to:

> Autonomous financial infrastructure

---

## ⚠️ Disclaimer

This is a hackathon MVP. Do not use with real funds.

---

## 👨‍💻 Author

Built for Solana Frontier Hackathon.

```
