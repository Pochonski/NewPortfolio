import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { THEME_SCRIPT } from "@/lib/themes";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://joseph-fonseca-dev.vercel.app"),
  verification: {
    google: "HlPNzvMhfJG88OXx5mtmY3jMBOkaZhYfs_DcDQhxi3A",
  },
};

// Next 16 requires <html>/<body> here. `lang` defaults to "es" statically
// to keep the root layout static; <LocaleLang> syncs it client-side on
// navigations (cookie NEXT_LOCALE + Accept-Language are handled there).
export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="es" suppressHydrationWarning className={mono.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
