import type { CSSProperties } from "react";

// Shared IDE chrome bits: macOS window dots + CTA button styles.

export function WindowDots({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <i className={`${s} rounded-full bg-[#ff5f57]`} />
      <i className={`${s} rounded-full bg-[#febc2e]`} />
      <i className={`${s} rounded-full bg-[#28c840]`} />
    </span>
  );
}

export type CtaVariant = "primary" | "ghost";

export function ctaClass(): string {
  return "rounded-md px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5";
}

export function ctaStyle(variant: CtaVariant): CSSProperties {
  return variant === "primary"
    ? {
        background: "var(--ide-button)",
        color: "var(--ide-button-fg)",
        boxShadow: "0 8px 24px rgba(var(--ide-accent-rgb), 0.3)",
      }
    : {
        border: "1px solid var(--ide-accent)",
        color: "var(--ide-accent)",
        background: "rgba(var(--ide-accent-rgb), 0.07)",
      };
}
