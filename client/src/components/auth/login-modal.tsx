"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signMessage: (message: Uint8Array, format: string) => Promise<{ signature: Uint8Array }>;
    };
  }
}

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("Sign this message to authenticate with AutoPay.");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("Ready.");

  async function handlePhantomConnect() {
    try {
      if (!window.solana) {
        setStatus("Phantom wallet not detected. Install it from phantom.app");
        return;
      }

      setStatus("Requesting Phantom connection...");

      const phantom = window.solana as any;
      const pubKeyResponse = await phantom.connect();
      const publicKey = pubKeyResponse.publicKey.toString();
      setPublicKey(publicKey);

      const msg = "Sign this message to authenticate with AutoPay.";
      const encoded = new TextEncoder().encode(msg);
      const signatureResponse = await phantom.signMessage(encoded, "utf8");
      const sig = Buffer.from(signatureResponse.signature).toString("base64");

      setMessage(msg);
      setSignature(sig);
      setStatus("Phantom connected. Logging in...");

      const res = await api.post("/api/auth/login", {
        publicKey,
        message: msg,
        signature: sig,
      });
      setAuthToken(res.data.token);
      localStorage.setItem("autopay-auth", JSON.stringify(res.data));
      setStatus("Authenticated.");
      router.push("/dashboard");
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (error.response?.data as { error?: string } | undefined)?.error;
        setStatus(backendMessage ?? "Phantom connection or login failed.");
      } else if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Phantom connection failed.");
      }
      console.error(error);
    }
  }

  async function handleManualLogin() {
    try {
      setStatus("Verifying signature...");
      const res = await api.post("/api/auth/login", {
        publicKey,
        message,
        signature,
      });
      setAuthToken(res.data.token);
      localStorage.setItem("autopay-auth", JSON.stringify(res.data));
      setStatus("Authenticated.");
      router.push("/dashboard");
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (error.response?.data as { error?: string } | undefined)?.error;
        setStatus(backendMessage ?? "Login failed. Check your signature.");
      } else {
        setStatus("Login failed. Check your signature.");
      }
      console.error(error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(231,195,91,0.08),transparent_50%)] p-8 md:p-10">
        <button onClick={onClose} className="absolute right-6 top-6 text-white/50 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <p className="text-sm uppercase tracking-[0.2em] text-gold-200/80">Authentication</p>
        <h2 className="mt-3 font-sans text-3xl font-semibold">Connect your wallet</h2>
        <p className="mt-2 text-base leading-7 text-white/65">Sign in securely with your Solana wallet to get started.</p>

        <div className="mt-8 space-y-6">
          <Button onClick={handlePhantomConnect} className="w-full flex items-center justify-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Connect Phantom Wallet
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[radial-gradient(circle_at_top_right,rgba(231,195,91,0.08),transparent_50%)] px-2 text-white/50">Or</span>
            </div>
          </div>

          <details className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-medium text-white hover:text-gold-300">
              Manual signature (advanced)
            </summary>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4">
                <Input placeholder="Public key" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
                <Input placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
                <Input placeholder="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
              </div>
              <Button onClick={handleManualLogin} className="w-full flex items-center justify-center">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </details>

          <p className="text-center text-sm text-white/55">{status}</p>
        </div>
      </div>
    </div>
  );
}
