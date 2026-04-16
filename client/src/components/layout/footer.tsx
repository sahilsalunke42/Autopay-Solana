export function Footer() {
  return (
    <footer className="mt-12 rounded-2xl border border-white/10 bg-black/35 p-7 md:mt-14 md:p-8 lg:p-10">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-4xl font-semibold md:text-5xl">AutoSol</p>
          <p className="mt-3 text-base text-white/70 md:text-lg">Autonomous payment engine for Solana</p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Links</p>
          <div className="mt-4 flex flex-col gap-2.5 text-base">
            <a href="https://github.com/sahilsalunke42/Autopay-Solana" target="_blank" rel="noopener noreferrer" className="text-white/85 transition hover:text-white">GitHub</a>
            <a href="/docs" className="text-white/85 transition hover:text-white">Docs</a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-white/85 transition hover:text-white">Solana</a>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Tech</p>
          <p className="mt-4 text-base text-white/85 md:text-lg">Solana | AI | Bun | Prisma</p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Disclaimer</p>
          <p className="mt-4 text-base leading-7 text-white/80 md:text-lg">Hackathon prototype. Do not use with real funds.</p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5 text-base text-white/65 md:text-lg">© 2026 AutoSol</div>
    </footer>
  );
}
