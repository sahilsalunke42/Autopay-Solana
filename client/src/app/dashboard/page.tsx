"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, Trash2, Pause, Play } from "lucide-react";
import { toast } from "react-toastify";
import { api, setAuthToken } from "@/lib/api";
import { pauseTask, resumeTask, deleteTask, executeTask, linkPrivateKey, createTask } from "@/lib/task-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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

export default function DashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [maxAmountLimit, setMaxAmountLimit] = useState("0.5");
  const [expiryAt, setExpiryAt] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function formatErrorMessage(error: string): string {
    // If it's a technical error, convert to user-friendly message
    if (error.includes("status code") || error.includes("request failed") || error.includes("ERR_")) {
      return "Invalid payment instruction. Please change your prompt and try again.";
    }
    if (error.includes("parse")) {
      return "This is a payments app, not a chatbot. Please use format: 'Pay 0.2 SOL daily to <address>'";
    }
    if (error.includes("unauthorized") || error.includes("authentication")) {
      return "Please authenticate first.";
    }
    // Return original error if it's already user-friendly
    return error || "Something went wrong. Please try again.";
  }

  useEffect(() => {
    const stored = localStorage.getItem("autopay-auth");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored) as AuthState;
    setAuth(parsed);
    setAuthToken(parsed?.token ?? null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!auth?.token) return;
    void refreshData();
  }, [auth]);

  async function refreshData() {
    try {
      const [taskRes, txRes] = await Promise.all([api.get("/api/task"), api.get("/api/transaction")]);
      setTasks(taskRes.data.tasks ?? []);
      setTransactions(txRes.data.transactions ?? []);
    } catch {
      // Silently fail on refresh
    }
  }

  async function handleLinkPrivateKey() {
    if (!privateKey.trim()) {
      toast.error("Enter your private key");
      return;
    }
    const result = await linkPrivateKey(privateKey);
    if (result.success) {
      toast.success("Private key linked successfully ✓");
      setPrivateKey("");
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  async function handleCreateTask() {
    if (!prompt.trim()) {
      toast.error("Please enter a payment instruction");
      return;
    }
    const result = await createTask({
      prompt,
      maxAmountLimit: Number(maxAmountLimit),
      expiryAt: expiryAt || undefined,
    });
    if (result.success) {
      toast.success("Task created successfully! 🎉");
      setPrompt("");
      setMaxAmountLimit("0.5");
      setExpiryAt("");
      await refreshData();
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  async function handleExecuteTask(taskId: string) {
    const result = await executeTask(taskId);
    if (result.success) {
      toast.success("Payment executed successfully ✓");
      await refreshData();
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  async function handlePauseTask(taskId: string) {
    const result = await pauseTask(taskId);
    if (result.success) {
      toast.success("Task paused ⏸");
      await refreshData();
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  async function handleResumeTask(taskId: string) {
    const result = await resumeTask(taskId);
    if (result.success) {
      toast.success("Task resumed ▶");
      await refreshData();
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }
    const result = await deleteTask(taskId);
    if (result.success) {
      toast.success("Task deleted ✓");
      await refreshData();
    } else {
      const friendlyError = formatErrorMessage(result.error || "");
      toast.error(friendlyError);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </main>
    );
  }

  if (!auth?.token) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8 md:px-10 md:py-10 xl:px-14">
        <Navbar walletConnected={true} authenticated={true} />

        <section className="grid gap-8 py-4 lg:grid-cols-[1.1fr_0.95fr] lg:gap-9 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gold-200/80">Dashboard</p>
              <h1 className="mt-3 max-w-3xl font-sans text-5xl font-semibold leading-[1.05]">
                Welcome back
              </h1>
              <p className="mt-2 text-base text-white/65">
                Wallet: {auth.user.publicKey.slice(0, 8)}...{auth.user.publicKey.slice(-6)}
              </p>
            </div>

            <Card className="relative overflow-hidden p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,195,91,0.12),transparent_20%)]" />
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.24em] text-gold-200/80">Wallet Security</p>
                <h2 className="mt-3 font-sans text-3xl font-semibold">Link your private key</h2>
                <p className="mt-2 text-base text-white/65">Your private key is encrypted and only used for transaction execution.</p>
                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                  <Input
                    placeholder="Your devnet private key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    type="password"
                  />
                  <Button onClick={handleLinkPrivateKey} className="md:min-w-[180px]">
                    Link Key
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="space-y-8"
          >
            <Card className="p-8">
              <div className="flex items-center gap-2 text-gold-300">
                <Wallet className="h-6 w-6" />
                <span className="text-sm uppercase tracking-[0.2em]">Create task</span>
              </div>
              <h3 className="mt-4 font-sans text-3xl font-semibold">New autopay</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Pay 0.2 SOL weekly to your_address'"
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-gold-300/50 focus:outline-none"
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-white/40">
                    💡 Tip: Use any variation like "pay", "send", or "transfer". Example: "Send 0.2 SOL daily to DgLbR..."
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={maxAmountLimit} onChange={(e) => setMaxAmountLimit(e.target.value)} placeholder="Max amount limit" />
                  <Input value={expiryAt} onChange={(e) => setExpiryAt(e.target.value)} placeholder="Expiry ISO date (optional)" />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create task <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-2xl font-semibold">Tasks</h3>
                <span className="text-sm uppercase tracking-[0.22em] text-white/45">{tasks.length} items</span>
              </div>
              <div className="mt-5 space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-base text-white/45">No tasks yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-lg font-medium text-white">{task.amount} {task.token}</p>
                          <p className="mt-1 text-sm text-white/50">
                            {task.frequency} · <span className={task.status === "ACTIVE" ? "text-green-400" : "text-yellow-400"}>{task.status}</span>
                          </p>
                          <p className="mt-1 truncate text-sm text-white/45">{task.receiverAddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {task.status === "ACTIVE" && (
                          <>
                            <Button onClick={() => void handleExecuteTask(task.id)} className="h-9 px-4 text-xs">
                              Execute
                            </Button>
                            <Button onClick={() => void handlePauseTask(task.id)} className="h-9 px-4 text-xs border-white/30 bg-transparent text-white hover:bg-white/5">
                              <Pause className="h-3 w-3 mr-1" /> Pause
                            </Button>
                          </>
                        )}
                        {task.status === "PAUSED" && (
                          <Button onClick={() => void handleResumeTask(task.id)} className="h-9 px-4 text-xs">
                            <Play className="h-3 w-3 mr-1" /> Resume
                          </Button>
                        )}
                        <Button onClick={() => void handleDeleteTask(task.id)} className="h-9 px-4 text-xs border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-2xl font-semibold">Transactions</h3>
                <span className="text-sm uppercase tracking-[0.22em] text-white/45">{transactions.length} logs</span>
              </div>
              <div className="mt-5 space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-base text-white/45">No transactions yet.</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="rounded-3xl border border-white/10 bg-black/20 p-5 text-base">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{tx.amount} SOL</p>
                        <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                          {tx.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/50">{tx.txHash || tx.error || "Pending"}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
