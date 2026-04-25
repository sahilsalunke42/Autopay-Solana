"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { Backpack, Sparkles, X } from "lucide-react";
import { BackpackWalletName, BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { PhantomWalletAdapter, PhantomWalletName } from "@solana/wallet-adapter-phantom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { api, setAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  onClose: () => void;
}

type SupportedWalletName = typeof PhantomWalletName | typeof BackpackWalletName;

const walletOptions: Array<{
  name: SupportedWalletName;
  label: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  {
    name: PhantomWalletName,
    label: "Phantom",
    description: "Connect using Phantom Wallet",
    icon: Sparkles,
  },
  {
    name: BackpackWalletName,
    label: "Backpack",
    description: "Connect using Backpack Wallet",
    icon: Backpack,
  },
];

export function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const { wallets, select, connect } = useWallet();

  async function handleWalletConnect(walletName: SupportedWalletName) {
    try {
      const selectedWallet = wallets.find((entry) => entry.adapter.name === walletName);
      if (!selectedWallet) {
        return;
      }

      if (selectedWallet.readyState === WalletReadyState.NotDetected) {
        const walletLabel = walletName === PhantomWalletName ? "Phantom" : "Backpack";
        toast.error(`${walletLabel} wallet is not detected in this browser.`);
        return;
      }

      select(walletName);
      await connect();

      const adapter = selectedWallet.adapter as PhantomWalletAdapter | BackpackWalletAdapter;
      const publicKey = adapter.publicKey?.toString();
      if (!publicKey) {
        throw new Error("Wallet connected but public key was not available.");
      }

      const message = "Sign this message to authenticate with AutoPay.";
      const encoded = new TextEncoder().encode(message);
      const signatureBytes = await adapter.signMessage(encoded);
      const signature = Buffer.from(signatureBytes).toString("base64");

      const res = await api.post("/api/auth/login", {
        publicKey,
        message,
        signature,
      });

      setAuthToken(res.data.token);
      localStorage.setItem("autopay-auth", JSON.stringify(res.data));
      router.push("/dashboard");
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = (error.response?.data as { error?: string } | undefined)?.error;
        toast.error(backendMessage ?? "Wallet connection or login failed.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Wallet connection failed.");
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
        <p className="mt-2 text-base leading-7 text-white/65">Choose Phantom or Backpack to sign in securely.</p>

        <div className="mt-8 space-y-4">
          {walletOptions.map((wallet) => {
            const availableWallet = wallets.find((entry) => entry.adapter.name === wallet.name);
            const installed = availableWallet?.readyState !== WalletReadyState.NotDetected;

            return (
              <Button
                key={wallet.label}
                onClick={() => void handleWalletConnect(wallet.name)}
                className="!h-auto flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left"
                disabled={!installed}
              >
                <span className="flex items-center gap-3">
                  <wallet.icon className="h-5 w-5" />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">Connect {wallet.label}</span>
                    <span className="text-xs font-normal text-black/70">{wallet.description}</span>
                  </span>
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-black/60">
                  {installed ? "Available" : "Install"}
                </span>
              </Button>
            );
          })}

          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
            Only Phantom and Backpack are supported for now.
          </p>
        </div>
      </div>
    </div>
  );
}