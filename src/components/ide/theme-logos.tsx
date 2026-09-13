// Original publisher logo marks for the Settings theme picker.
// Simplified own artwork in each brand's official colors (no external assets,
// no network, crisp at any size). Follows the same inline-SVG pattern as
// ./icons.tsx (vendored Material Icon Theme artwork).

export type ThemeLogoKind = "porto-dark" | "porto-light" | "dracula" | "nord" | "one-dark";

interface LogoProps {
  size?: number;
  className?: string;
}

function Frame({
  size = 28,
  label,
  className,
  children,
}: LogoProps & { label: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      role="img"
      aria-label={label}
      className={`shrink-0 rounded-[6px] ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

/** Porto Dark — mint code brackets on near-black. */
export function PortoDarkLogo(props: LogoProps) {
  return (
    <Frame label="Porto Dark logo" {...props}>
      <rect width="32" height="32" rx="7" fill="#1c1c1c" />
      <rect width="32" height="32" rx="7" fill="none" stroke="#2d2d2d" strokeWidth="1.5" />
      <path
        d="M12.5 11 8 16l4.5 5"
        fill="none"
        stroke="#b8f2e6"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 11 24 16l-4.5 5"
        fill="none"
        stroke="#b8f2e6"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Porto Light — slate brackets on paper. */
export function PortoLightLogo(props: LogoProps) {
  return (
    <Frame label="Porto Light logo" {...props}>
      <rect width="32" height="32" rx="7" fill="#fafafa" />
      <rect width="32" height="32" rx="7" fill="none" stroke="#d3d9dd" strokeWidth="1.5" />
      <path
        d="M12.5 11 8 16l4.5 5"
        fill="none"
        stroke="#5e6472"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 11 24 16l-4.5 5"
        fill="none"
        stroke="#5e6472"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Dracula — vampire mark: purple orb with fangs on Dracula bg. */
export function DraculaLogo(props: LogoProps) {
  return (
    <Frame label="Dracula logo" {...props}>
      <rect width="32" height="32" rx="7" fill="#282a36" />
      <circle cx="16" cy="14" r="8" fill="#bd93f9" />
      <circle cx="13.2" cy="11.5" r="1.6" fill="#f8f8f2" />
      <circle cx="18.8" cy="11.5" r="1.6" fill="#f8f8f2" />
      <path d="M12.5 17.5h7l-1.6 4.2a1 1 0 0 1-1.7.4L16 21l-.2 1.1a1 1 0 0 1-1.7-.4Z" fill="#f8f8f2" />
      <path d="M6 25.5c3-1.2 6.5-1.8 10-1.8s7 .6 10 1.8" fill="none" stroke="#ff79c6" strokeWidth="1.8" strokeLinecap="round" />
    </Frame>
  );
}

/** Nord — arctic peaks under a frost sun. */
export function NordLogo(props: LogoProps) {
  return (
    <Frame label="Nord logo" {...props}>
      <rect width="32" height="32" rx="7" fill="#2e3440" />
      <circle cx="22" cy="10" r="3" fill="#88c0d0" />
      <path d="M4 24 12 12l5 7 3.5-4.5L28 24Z" fill="#eceff4" />
      <path d="M4 24h24v3.5a7 7 0 0 1-7 4.5H4Z" fill="#434c5e" />
      <path d="M12 12l2.2 3-2.2 2-2.2-2Z" fill="#88c0d0" />
    </Frame>
  );
}

/** One Dark Pro — atom orbits on One Dark bg. */
export function OneDarkLogo(props: LogoProps) {
  return (
    <Frame label="One Dark logo" {...props}>
      <rect width="32" height="32" rx="7" fill="#282c34" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#61afef" strokeWidth="1.8" />
      <ellipse
        cx="16"
        cy="16"
        rx="10"
        ry="4"
        fill="none"
        stroke="#61afef"
        strokeWidth="1.8"
        transform="rotate(60 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="10"
        ry="4"
        fill="none"
        stroke="#61afef"
        strokeWidth="1.8"
        transform="rotate(120 16 16)"
      />
      <circle cx="16" cy="16" r="2.4" fill="#98c379" />
    </Frame>
  );
}

export function ThemeLogo({ kind, ...rest }: LogoProps & { kind: ThemeLogoKind }) {
  switch (kind) {
    case "porto-dark":
      return <PortoDarkLogo {...rest} />;
    case "porto-light":
      return <PortoLightLogo {...rest} />;
    case "dracula":
      return <DraculaLogo {...rest} />;
    case "nord":
      return <NordLogo {...rest} />;
    case "one-dark":
      return <OneDarkLogo {...rest} />;
  }
}
