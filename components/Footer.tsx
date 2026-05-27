export default function Footer() {
  return (
    <footer
      className="border-t border-[var(--border)] py-8 px-4"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white font-heading"
            style={{ background: "var(--accent)" }}
          >
            SL
          </div>
          <span className="text-sm font-medium">Samuvel L</span>
        </div>

        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
          Built with Next.js · Tailwind CSS · Framer Motion
        </p>

        <p className="text-xs" style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} Samuvel L
        </p>
      </div>
    </footer>
  );
}
