import { useRouter } from "next/navigation";
import AutoSol from "@/assets/AutoSol.png";

type NavbarProps = {
  walletConnected?: boolean;
  authenticated?: boolean;
  onLoginClick?: () => void;
};

export function Navbar({ walletConnected, authenticated, onLoginClick }: NavbarProps) {
  const router = useRouter();
  const isDashboard = typeof window !== "undefined" && window.location.pathname === "/dashboard";
  const isTransactions = typeof window !== "undefined" && window.location.pathname === "/transactions";

  async function handleLogout() {
    try {
      localStorage.removeItem("autopay-auth");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "https://autopay-solana.onrender.com"}/api/auth/logout`, {
        method: "POST",
      }).catch(() => null);
      router.push("/");
    } catch {
      router.push("/");
    }
  }

  return (
    <nav className="sticky top-4 z-50 mb-6 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-xl md:px-5 md:py-3">
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        <a href="/" className="mr-2 inline-flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gold-300 text-sm font-bold text-black">
            <img src={AutoSol.src} alt="AutoSol" className="h-full w-full" />
          </span>
          <span className="text-base font-semibold">AutoSol</span>
        </a>

        {authenticated && (
          <>
            <a href="/dashboard" className={`text-xs transition hover:text-white ${isDashboard ? "text-gold-200" : "text-white/80"}`}>
              Dashboard
            </a>
            <a href="/dashboard" className={`text-xs transition hover:text-white ${isDashboard ? "text-gold-200" : "text-white/80"}`}>
              Tasks
            </a>
            <a href="/transactions" className={`text-xs transition hover:text-white ${isTransactions ? "text-gold-200" : "text-white/80"}`}>
              Transactions
            </a>

            <span className="hidden text-white/35 md:inline">|</span>
          </>
        )}

        <span className="hidden text-white/35 md:inline">|</span>

        {authenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/90 transition hover:border-gold-300/40 hover:text-white"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className="ml-auto rounded-full border border-gold-300 bg-gold-300 px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-gold-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

