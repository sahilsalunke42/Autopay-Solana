"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock3, ReceiptText } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginModal } from "../components/auth/login-modal";

const featureCards = [
  { icon: ShieldCheck, title: "Wallet-native auth", text: "Sign a message and the backend handles signup/login in one pass." },
  { icon: Clock3, title: "Autopay scheduling", text: "Create recurring payments and let them execute automatically." },
  { icon: ReceiptText, title: "Execution logs", text: "See every success or failure recorded as a transaction entry." },
];

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(231,195,91,0.12),_transparent_26%),linear-gradient(180deg,#0d0d10_0%,#050505_100%)] text-white">
      <div className="mx-auto max-w-[1300px] px-5 py-6 md:px-8 md:py-8 xl:px-10">
        <Navbar onLoginClick={() => setShowLoginModal(true)} />

        <section className="grid gap-7 py-12 lg:grid-cols-2 lg:gap-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gold-200/80">AutoSol</p>
              <h1 className="mt-2.5 max-w-4xl font-sans text-4xl font-semibold leading-[1.08] md:text-5xl">
                Autonomous payment engine for Solana
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Sign in with your wallet, create recurring payments in seconds, and let AutoSol handle the rest. No code, no hassle.
              </p>
            </div>

            <Button onClick={() => setShowLoginModal(true)} className="inline-flex items-center max-w-xs">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid gap-5"
          >
            {featureCards.map((item) => (
              <Card key={item.title} className="p-6">
                <item.icon className="h-5 w-5 text-gold-300" />
                <h3 className="mt-3 font-sans text-xl font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
              </Card>
            ))}
          </motion.div>
        </section>

        <Footer />
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </main>
  );
}

