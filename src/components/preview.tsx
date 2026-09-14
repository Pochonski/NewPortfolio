import type { ReactNode } from "react";

// Shared premium preview system (server-safe): every portfolio preview card,
// tag pill and section header speaks the same visual language.

export function PreviewCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`${hover ? "card-premium transition-all hover:-translate-y-1 " : ""}rounded-xl border ${className}`}
      style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}
    >
      {children}
    </div>
  );
}

export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[11px]"
      style={{
        borderColor: "var(--ide-border)",
        background: "rgba(var(--ide-accent-rgb), 0.07)",
        color: "var(--ide-accent)",
      }}
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
          className="rounded-full border px-2 py-0.5 font-mono text-[10px] normal-case"
          style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg-dim)" }}
        >
          {count}
        </span>
      )}
    </h2>
  );
}
