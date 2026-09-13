import Link from "next/link";

// Fallback for routes outside any locale (rare: middleware rewrites to
// /[locale]/not-found in almost every case). No providers available here,
// so this stays dependency-free and bilingual by hand.
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body
        style={{
          background: "#1c1c1c",
          color: "#aed9e0",
          fontFamily: "monospace",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 64, margin: 0, color: "#b8f2e6" }}>404</p>
          <p>Archivo no encontrado / File not found</p>
          <Link href="/" style={{ color: "#b8f2e6" }}>
            → home.tsx
          </Link>
        </div>
      </body>
    </html>
  );
}
