import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#4cc9a8";
const BG = "#0d1117";
const FG = "#e6edf3";
const DIM = "#8b949e";

function Chip({ label }: { label: string }) {
  return (
    <div
      style={{
        border: "1px solid #30363d",
        borderRadius: 999,
        padding: "8px 20px",
        fontSize: 28,
        color: ACCENT,
        background: "rgba(76, 201, 168, 0.08)",
      }}
    >
      {label}
    </div>
  );
}

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: BG,
          borderTop: `8px solid ${ACCENT}`,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            borderRadius: 32,
            fontSize: 96,
            fontWeight: 700,
            color: BG,
            background: ACCENT,
          }}
        >
          JF
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 30, color: DIM }}>portfolio › home.tsx</div>
          <div style={{ fontSize: 84, fontWeight: 700, color: FG, lineHeight: 1 }}>
            Joseph Fonseca
          </div>
          <div style={{ fontSize: 34, color: ACCENT }}>
            Ingeniero de Software — React · Next.js · Supabase
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Chip label="React" />
            <Chip label="Next.js" />
            <Chip label="TypeScript" />
            <Chip label="Supabase" />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
