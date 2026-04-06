import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AutoPay Solana",
  description: "Wallet-authenticated Solana autopay demo built for the hackathon.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
