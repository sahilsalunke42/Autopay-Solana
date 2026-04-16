"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, setAuthToken } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

type AuthState = {
  token: string;
  user: { id: string; walletId: string; publicKey: string };
} | null;

type Transaction = {
  id: string;
  amount: number;
  status: string;
  txHash?: string | null;
  error?: string | null;
  executedAt: string;
};

export default function TransactionsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

    async function refreshTransactions() {
      try {
        const txRes = await api.get("/api/transaction");
        setTransactions(txRes.data.transactions ?? []);
      } catch {
        setTransactions([]);
      }
    }

    void refreshTransactions();
  }, [auth]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white">
        <p className="text-white/60">Loading...</p>
      </main>
    );
  }

  if (!auth?.token) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white">
      <div className="mx-auto max-w-[1300px] px-5 py-6 md:px-8 md:py-8 xl:px-10">
        <Navbar walletConnected={true} authenticated={true} />

        <section className="py-4 md:py-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold-200/80">Dashboard</p>
              <h1 className="mt-2.5 font-sans text-4xl font-semibold leading-[1.08]">Transactions</h1>
              <p className="mt-1.5 text-sm text-white/60">Review all payment execution logs here.</p>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-xl font-semibold">Transaction Logs</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-white/45">{transactions.length} items</span>
              </div>

              <div className="mt-4 space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-white/45">No transactions yet.</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-medium">{tx.amount} SOL</p>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/55">
                          {tx.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/50 break-all">{tx.txHash || tx.error || "Pending"}</p>
                      <p className="mt-1 text-xs text-white/35">{new Date(tx.executedAt).toLocaleString()}</p>
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
