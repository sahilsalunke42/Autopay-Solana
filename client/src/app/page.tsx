"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, Clock3, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type AuthState = {
  token: string;
  user: { id: string; walletId: string; publicKey: string };
} | null;

type Task = {
  id: string;
  amount: number;
  token: string;
  receiverAddress: string;
  frequency: string;
  status: string;
  nextExecutionAt: string;
};

type Transaction = {
  id: string;
  amount: number;
  status: string;
  txHash?: string | null;
  error?: string | null;
  executedAt: string;
};

const featureCards = [
  { icon: ShieldCheck, title: "Wallet-native auth", text: "Sign a message and the backend handles signup/login in one pass." },
  { icon: Clock3, title: "Autopay scheduling", text: "Create recurring payments from natural language in a few seconds." },
  { icon: ReceiptText, title: "Execution logs", text: "See every success or failure recorded as a transaction entry." },
];

export default function Page() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("message to sign for authentication");
  const [signature, setSignature] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [prompt, setPrompt] = useState("Pay 0.2 SOL weekly to 7f3mJQ8Hj9hY7Qm2uQyVJQkM7dq2W3XEjL6sCVf8K9Mb");
  const [maxAmountLimit, setMaxAmountLimit] = useState("0.5");
  const [expiryAt, setExpiryAt] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("Ready.");

  const canUseBackend = useMemo(() => Boolean(auth?.token), [auth]);

  useEffect(() => {
    const stored = localStorage.getItem("autopay-auth");
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState;
      setAuth(parsed);
      setAuthToken(parsed?.token ?? null);
    }
  }, []);

  useEffect(() => {
    if (!canUseBackend) return;
    void refreshData();
  }, [canUseBackend]);

  async function refreshData() {
    try {
      const [taskRes, txRes] = await Promise.all([api.get("/task"), api.get("/transaction")]);
      setTasks(taskRes.data.tasks ?? []);
      setTransactions(txRes.data.transactions ?? []);
    } catch {
      setStatus("Connected, but could not load protected resources yet.");
    }
  }

  async function handleLogin() {
    try {
      setStatus("Verifying signature...");
      const res = await api.post("/auth/login", {
        publicKey,
        message,
        signature,
        privateKey: privateKey || undefined,
      });
      setAuth(res.data);
      setAuthToken(res.data.token);
      localStorage.setItem("autopay-auth", JSON.stringify(res.data));
      setStatus("Authenticated.");
      await refreshData();
    } catch (error) {
      setStatus("Login failed. Use a real wallet signature, not placeholder text.");
      console.error(error);
    }
  }

  async function handleCreateTask() {
    try {
      setStatus("Creating task...");
      await api.post("/task/create", {
        prompt,
        maxAmountLimit: Number(maxAmountLimit),
        expiryAt: expiryAt || undefined,
      });
      setStatus("Task created.");
      await refreshData();
    } catch (error) {
      setStatus("Task creation failed.");
      console.error(error);
    }
  }

  async function handleManualExecute(taskId: string) {
    try {
      setStatus("Executing payment...");
      await api.post(`/task/execute/${taskId}`);
      setStatus("Execution complete.");
      await refreshData();
    } catch (error) {
      setStatus("Execution failed.");
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-200/80">AutoPay Solana</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-4xl">A clean crypto autopay solution built on top of solana</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 md:flex">
            <Sparkles className="h-4 w-4 text-gold-300" />
            Built by <a href="https://github.com/sahilsalunke42/" target="_blank" rel="noopener noreferrer" className="text-gold-300 hover:underline">@autopay-solana</a>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((item) => (
                <Card key={item.title} className="p-5">
                  <item.icon className="h-5 w-5 text-gold-300" />
                  <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                </Card>
              ))}
            </div>

            <Card className="relative overflow-hidden p-7 md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,195,91,0.12),transparent_20%)]" />
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.25em] text-gold-200/80">Wallet login</p>
                <h2 className="mt-3 text-3xl font-semibold">Sign once. Create recurring payments. Execute on schedule.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                  This single-page app stays intentionally focused: authenticate with a Solana wallet, create a task from natural language, and manage executions from one view.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Input placeholder="Public key" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
                  <Input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
                  <Input placeholder="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
                  <Input placeholder="Private key (first link only)" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button onClick={handleLogin}>
                    Login with Wallet <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-sm text-white/55">{status}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="space-y-6"
          >
            <Card className="p-7">
              <div className="flex items-center gap-2 text-gold-300">
                <Wallet className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.2em]">Task builder</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">Natural language autopay</h3>
              <div className="mt-5 space-y-3">
                <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Pay 0.2 SOL weekly to..." />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={maxAmountLimit} onChange={(e) => setMaxAmountLimit(e.target.value)} placeholder="Max amount limit" />
                  <Input value={expiryAt} onChange={(e) => setExpiryAt(e.target.value)} placeholder="Expiry ISO date (optional)" />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create task <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <span className="text-xs uppercase tracking-[0.25em] text-white/45">{tasks.length} items</span>
              </div>
              <div className="mt-4 space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-white/45">No tasks yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{task.amount} {task.token}</p>
                          <p className="mt-1 text-xs text-white/50">{task.frequency} · {task.status}</p>
                          <p className="mt-1 truncate text-xs text-white/45">{task.receiverAddress}</p>
                        </div>
                        <Button onClick={() => void handleManualExecute(task.id)} className="h-9 px-4 text-xs">
                          Execute
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transactions</h3>
                <span className="text-xs uppercase tracking-[0.25em] text-white/45">{transactions.length} logs</span>
              </div>
              <div className="mt-4 space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-white/45">No transactions yet.</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{tx.amount} SOL</p>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                          {tx.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/50">{tx.txHash || tx.error || "Pending"}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
