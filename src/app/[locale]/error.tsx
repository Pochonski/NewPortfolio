"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("locale route error", error);
  }, [error]);

  return (
    <div
      className="mx-auto flex min-h-[50dvh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: "var(--ide-bg)", color: "var(--ide-fg)" }}
      role="alert"
    >
      <p className="font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
        portfolio › error
      </p>
      <h1 className="mt-4 text-xl font-semibold" style={{ color: "var(--ide-fg-bright)" }}>
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm" style={{ color: "var(--ide-fg-dim)" }}>
        The editor hit an unexpected error. Your files are safe — try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-md px-5 py-2.5 text-sm font-semibold"
        style={{ background: "var(--ide-button)", color: "var(--ide-button-fg)" }}
      >
        Try again
      </button>
    </div>
  );
}
