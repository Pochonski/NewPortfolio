import type { ReactNode } from "react";

// Shared premium preview system (server-safe): every portfolio preview card,
// tag pill and section header speaks the same visual language.
// Glass tiers come from globals.css (.glass, .glass-subtle, .glass-strong)
// so the system stays theme-aware and the components stay simple.

export function AmbientAurora() {
  return <div aria-hidden className="aurora" />;
}

export function PreviewCard({
  children,
  className = "",
  hover = true,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  /** Glass tier: "default" (.glass), "strong" (.glass-strong), or "none" (legacy flat surface). */
  tone?: "default" | "strong" | "none";
}) {
  const glassClass = tone === "strong" ? "glass-strong" : tone === "none" ? "" : "glass";
  const hoverClass = hover && glassClass ? `${glassClass} hover-glass` : glassClass;
  return (
    <div
      className={`${hoverClass} rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span
      className="glass-subtle rounded-full px-2 py-0.5 font-mono text-[11px]"
      style={{ color: "var(--ide-accent)" }}
    >
      {children}
    </span>
  );
}

export function SectionHeader({ label, count }: { label: ReactNode; count?: number }) {
  return (
    <h2
      className="mb-4 flex items-center gap-2 font-mono text-xs tracking-wider uppercase"
      style={{ color: "var(--ide-fg-dim)" }}
    >
      <span aria-hidden className="h-px w-4" style={{ background: "var(--ide-accent)" }} />
      {label}
      {count !== undefined && (
        <span
          className="glass-subtle rounded-full px-2 py-0.5 font-mono text-[10px] normal-case"
          style={{ color: "var(--ide-fg-dim)" }}
        >
          {count}
        </span>
      )}
    </h2>
  );
}
