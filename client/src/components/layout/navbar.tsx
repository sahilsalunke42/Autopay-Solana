type NavbarProps = {
  walletConnected: boolean;
};

export function Navbar({ walletConnected }: NavbarProps) {
  return (
    <nav className="sticky top-4 z-50 mb-8 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <a href="#dashboard" className="mr-2 inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold-300 text-sm font-bold text-black">A</span>
          <span className="text-lg font-semibold">Autonomi</span>
        </a>

        <a href="#dashboard" className="text-sm text-white/80 transition hover:text-white">Dashboard</a>
        <a href="#tasks" className="text-sm text-white/80 transition hover:text-white">Tasks</a>
        <a href="#transactions" className="text-sm text-white/80 transition hover:text-white">Transactions</a>

        <span className="hidden text-white/35 md:inline">|</span>

        <a href="#create-task" className="text-sm font-medium text-gold-200 transition hover:text-gold-50">Create Task</a>

        <span className="hidden text-white/35 md:inline">|</span>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("dashboard");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="ml-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 transition hover:border-gold-300/40 hover:text-white"
        >
          {walletConnected ? "Wallet Connected" : "Wallet / Connect"}
        </button>
      </div>
    </nav>
  );
}
