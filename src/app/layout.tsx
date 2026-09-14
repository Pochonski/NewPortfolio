import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { JetBrains_Mono } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/themes";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://joseph-fonseca-dev.vercel.app"),
};

// Next 16 requires <html>/<body> here. `lang` resolves server-side from the
// NEXT_LOCALE cookie (set by next-intl) with Accept-Language fallback;
// <LocaleLang> keeps it synced client-side on navigations.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const accept = (await headers()).get("accept-language") ?? "";
  const lang =
    cookieLocale === "en" || cookieLocale === "es"
      ? cookieLocale
      : accept.toLowerCase().startsWith("en")
        ? "en"
        : "es";
  return (
    <html lang={lang} suppressHydrationWarning className={mono.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
