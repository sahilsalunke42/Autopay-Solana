export function Footer() {
  return (
    <footer className="mt-16 rounded-3xl border border-white/10 bg-black/35 p-10 md:mt-20 md:p-12 lg:p-14">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-5xl font-semibold md:text-6xl">Autonomi</p>
          <p className="mt-4 text-lg text-white/70 md:text-xl">Autonomous payment engine for Solana</p>
        </div>

        <div>
          <p className="text-base uppercase tracking-[0.22em] text-white/60">Links</p>
          <div className="mt-5 flex flex-col gap-3 text-lg">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/85 transition hover:text-white">GitHub</a>
            <a href="/docs" className="text-white/85 transition hover:text-white">Docs</a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-white/85 transition hover:text-white">Solana</a>
          </div>
        </div>

        <div>
          <p className="text-base uppercase tracking-[0.22em] text-white/60">Tech</p>
          <p className="mt-5 text-lg text-white/85 md:text-xl">Solana | AI | Bun | Prisma</p>
        </div>

        <div>
          <p className="text-base uppercase tracking-[0.22em] text-white/60">Disclaimer</p>
          <p className="mt-5 text-lg leading-8 text-white/80 md:text-xl">Hackathon prototype. Do not use with real funds.</p>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-lg text-white/65 md:text-xl">© 2026 AutoSol</div>
    </footer>
  );
}
