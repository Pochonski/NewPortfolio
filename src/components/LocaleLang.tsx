"use client";

import { useEffect } from "react";

// Keeps <html lang> in sync with the active locale (the root layout
// owns <html> in Next 16, so nested layouts can't set it server-side).
export function LocaleLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
