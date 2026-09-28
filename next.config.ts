import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { IDE_FRAME_ORIGINS } from "./src/lib/files";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // va.vercel-scripts.com: Vercel Analytics. 'unsafe-eval' only in dev (React devtools/HMR need eval; prod never uses it).
              // googletagmanager.com / google-analytics.com: Google Analytics 4 (gtag.js via @next/third-parties/google).
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.resend.com https://vitals.vercel-insights.com https://challenges.cloudflare.com https://www.google-analytics.com https://analytics.google.com https://*.googletagmanager.com",
              // Integrated browser (SiteBrowser iframe): only the portfolio's
              // own live projects may be framed (see IDE_FRAME_ORIGINS in src/lib/files.ts).
              // challenges.cloudflare.com: Turnstile captcha widget.
              `frame-src ${[...IDE_FRAME_ORIGINS, "https://challenges.cloudflare.com"].join(" ")}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
