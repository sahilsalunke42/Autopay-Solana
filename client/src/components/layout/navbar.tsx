import { useRouter } from "next/navigation";
import AutoSol from "@/assets/AutoSol.png";

type NavbarProps = {
  walletConnected?: boolean;
  authenticated?: boolean;
  onLoginClick?: () => void;
};

export function Navbar({ walletConnected, authenticated, onLoginClick }: NavbarProps) {
  const router = useRouter();

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
    <nav className="sticky top-4 z-50 mb-8 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <a href="/" className="mr-2 inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-300 text-sm font-bold text-black">
            <img src={AutoSol.src} alt="AutoSol" className="h-full w-full" />
          </span>
          <span className="text-lg font-semibold">AutoSol</span>
        </a>

        {authenticated && (
          <>
            <a href="/dashboard" className="text-sm text-white/80 transition hover:text-white">
              Dashboard
            </a>
            <a href="/dashboard" className="text-sm text-white/80 transition hover:text-white">
              Tasks
            </a>
            <a href="/dashboard" className="text-sm text-white/80 transition hover:text-white">
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
            className="ml-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 transition hover:border-gold-300/40 hover:text-white"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className="ml-auto rounded-full border border-gold-300 bg-gold-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

