// Vendored from material-icon-theme (MIT, PKief.material-icon-theme v5.38.1)
// Only the icons needed by the portfolio are inlined here to keep the
// bundle lean instead of depending on the full 1000+ icon package.
// Source: https://github.com/material-extensions/vscode-material-icon-theme

interface IconProps {
  size?: number;
  className?: string;
}

function Base({
  size = 16,
  viewBox,
  children,
  label,
  className,
}: IconProps & { viewBox: string; children: React.ReactNode; label: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      aria-hidden
      focusable="false"
      role="img"
      aria-label={label}
      className={`shrink-0 ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

export function ReactIcon(props: IconProps) {
  return (
    <Base viewBox="0 0 32 32" label="React" {...props}>
      <path fill="#00bcd4" d="M16 12c7.444 0 12 2.59 12 4s-4.556 4-12 4-12-2.59-12-4 4.556-4 12-4m0-2c-7.732 0-14 2.686-14 6s6.268 6 14 6 14-2.686 14-6-6.268-6-14-6" />
      <path fill="#00bcd4" d="M16 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2" />
      <path fill="#00bcd4" d="M10.458 5.507c2.017 0 5.937 3.177 9.006 8.493 3.722 6.447 3.757 11.687 2.536 12.392a.9.9 0 0 1-.457.1c-2.017 0-5.938-3.176-9.007-8.492C8.814 11.553 8.779 6.313 10 5.608a.9.9 0 0 1 .458-.1m-.001-2A2.87 2.87 0 0 0 9 3.875C6.13 5.532 6.938 12.304 10.804 19c3.284 5.69 7.72 9.493 10.74 9.493A2.87 2.87 0 0 0 23 28.124c2.87-1.656 2.062-8.428-1.804-15.124-3.284-5.69-7.72-9.493-10.74-9.493Z" />
      <path fill="#00bcd4" d="M21.543 5.507a.9.9 0 0 1 .457.1c1.221.706 1.186 5.946-2.536 12.393-3.07 5.316-6.99 8.493-9.007 8.493a.9.9 0 0 1-.457-.1C8.779 25.686 8.814 20.446 12.536 14c3.07-5.316 6.99-8.493 9.007-8.493m0-2c-3.02 0-7.455 3.804-10.74 9.493C6.939 19.696 6.13 26.468 9 28.124a2.87 2.87 0 0 0 1.457.369c3.02 0 7.455-3.804 10.74-9.493C25.061 12.304 25.87 5.532 23 3.876a2.87 2.87 0 0 0-1.457-.369" />
    </Base>
  );
}

export function TypeScriptIcon(props: IconProps) {
  return (
    <Base viewBox="0 0 16 16" label="TypeScript" {...props}>
      <path fill="#0288d1" d="M2 2v12h12V2zm4 6h3v1H8v4H7V9H6zm5 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1" />
    </Base>
  );
}

export function JavaScriptIcon(props: IconProps) {
  return (
    <Base viewBox="0 0 16 16" label="JavaScript" {...props}>
      <path fill="#ffca28" d="M2 2v12h12V2zm6 6h1v4a1.003 1.003 0 0 1-1 1H7a1.003 1.003 0 0 1-1-1v-1h1v1h1zm3 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1" />
    </Base>
  );
}

export function JsonIcon(props: IconProps) {
  return (
    <Base viewBox="0 -960 960 960" label="JSON" {...props}>
      <path fill="#f9a825" d="M560-160v-80h120q17 0 28.5-11.5T720-280v-80q0-38 22-69t58-44v-14q-36-13-58-44t-22-69v-80q0-17-11.5-28.5T680-720H560v-80h120q50 0 85 35t35 85v80q0 17 11.5 28.5T840-560h40v160h-40q-17 0-28.5 11.5T800-360v80q0 50-35 85t-85 35zm-280 0q-50 0-85-35t-35-85v-80q0-17-11.5-28.5T120-400H80v-160h40q17 0 28.5-11.5T160-600v-80q0-50 35-85t85-35h120v80H280q-17 0-28.5 11.5T240-680v80q0 38-22 69t-58 44v14q36 13 58 44t22 69v80q0 17 11.5 28.5T280-240h120v80z" />
    </Base>
  );
}

export function MarkdownIcon(props: IconProps) {
  return (
    <Base viewBox="0 0 32 32" label="Markdown" {...props}>
      <path fill="#42a5f5" d="m14 10-4 3.5L6 10H4v12h4v-6l2 2 2-2v6h4V10zm12 6v-6h-4v6h-4l6 8 6-8z" />
    </Base>
  );
}

export function CssIcon(props: IconProps) {
  return (
    <Base viewBox="0 0 32 32" label="CSS" {...props}>
      <path fill="#7e57c2" d="M20 18h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 20 22h2v2h2v-2c0-.388-.562-.851-1.254-1.034C20.356 20.34 20 18.84 20 18m-3.254 2.966C14.356 20.34 14 18.84 14 18h-2v-2h-2v8h2v-2h4v2h2v-2c0-.388-.562-.851-1.254-1.034" />
      <path fill="#7e57c2" d="M24 4H4v20a4 4 0 0 0 4 4h16.16A3.84 3.84 0 0 0 28 24.16V8a4 4 0 0 0-4-4m2 14h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 26 22v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z" />
    </Base>
  );
}

// ---------------------------------------------------------------------------
// Folder icons (closed / open variants, same artwork as VS Code Material
// Icon Theme; the open state uses the "flap" body path from *-open.svg).
// ---------------------------------------------------------------------------

const FOLDER_CLOSED =
  "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232";
const FOLDER_OPEN =
  "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6";

const SRC_MOTIVE =
  "M9.225 15a.5.5 0 0 1-.12-.014.57.568 0 0 1-.414-.661l1.549-7.872a.566.565 0 0 1 .254-.372.53.53 0 0 1 .4-.067.57.57 0 0 1 .415.662l-1.552 7.872a.56.56 0 0 1-.253.371.53.53 0 0 1-.28.081m3.105-1h-.038a.54.54 0 0 1-.382-.206.583.583 0 0 1 .057-.774l2.664-2.483-2.653-2.312a.583.583 0 0 1-.08-.772.54.54 0 0 1 .377-.218.53.53 0 0 1 .406.129l3.126 2.727a.579.578 0 0 1 .002.862l-3.114 2.904a.536.535 0 0 1-.365.144zm-4.661 0a.536.535 0 0 1-.365-.146L4.186 10.95a.58.58 0 0 1-.005-.846l.01-.01 3.128-2.726a.516.516 0 0 1 .4-.13.54.54 0 0 1 .38.218.583.583 0 0 1-.08.773l-2.65 2.31 2.663 2.482a.579.578 0 0 1 .056.774.536.536 0 0 1-.381.206z";
const DOCS_MOTIVE =
  "M12 5H8.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8Zm0 8H9v-1h3zm2-2H9v-1h5zm-2.414-2.586V6L14 8.414Z";
const DB_MOTIVE =
  "M12 5a4 2 0 0 0-4 2 4 2 0 0 0 4 2 4 2 0 0 0 4-2 4 2 0 0 0-4-2M8 8v2c0 1.105 1.791 2 4 2s4-.895 4-2V8c0 1.105-1.791 2-4 2s-4-.895-4-2m0 3v2c0 1.105 1.791 2 4 2s4-.895 4-2v-2c0 1.105-1.791 2-4 2s-4-.895-4-2";
const CSS_MOTIVE =
  "M7 10V9H6v4h1v-1h1v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1Zm5 0V9a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1c0 .42.179 1.17 1.373 1.483.346.092.627.323.627.517v1h-1v-1H9v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1.67 1.67 0 0 0-1.373-1.483C10 10.352 10 10.097 10 10V9h1v1Zm4 0V9a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1c0 .42.179 1.17 1.373 1.483.346.092.627.323.627.517v1h-1v-1h-1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1.67 1.67 0 0 0-1.373-1.483C14 10.352 14 10.097 14 10V9h1v1Z";

export function FolderSrcIcon({ open, ...rest }: IconProps & { open?: boolean }) {
  return (
    <Base viewBox="0 0 16 16" label={open ? "Open src folder" : "Src folder"} {...rest}>
      <path fill="#4caf50" d={open ? FOLDER_OPEN : FOLDER_CLOSED} />
      <path fill="#c8e6c9" d={SRC_MOTIVE} />
    </Base>
  );
}

export function FolderDocsIcon({ open, ...rest }: IconProps & { open?: boolean }) {
  return (
    <Base viewBox="0 0 16 16" label={open ? "Open docs folder" : "Docs folder"} {...rest}>
      <path fill="#0277bd" d={open ? FOLDER_OPEN : FOLDER_CLOSED} />
      <path fill="#b3e5fc" d={DOCS_MOTIVE} />
    </Base>
  );
}

export function FolderDatabaseIcon({ open, ...rest }: IconProps & { open?: boolean }) {
  return (
    <Base viewBox="0 0 16 16" label={open ? "Open data folder" : "Data folder"} {...rest}>
      <path fill="#ffca28" d={open ? FOLDER_OPEN : FOLDER_CLOSED} />
      <path fill="#ffecb3" d={DB_MOTIVE} />
    </Base>
  );
}

export function FolderCssIcon({ open, ...rest }: IconProps & { open?: boolean }) {
  return (
    <Base viewBox="0 0 16 16" label={open ? "Open styles folder" : "Styles folder"} {...rest}>
      <path fill="#7e57c2" d={open ? FOLDER_OPEN : FOLDER_CLOSED} />
      <path fill="#d1c4e9" d={CSS_MOTIVE} />
    </Base>
  );
}

export function FolderConfigIcon({ open, ...rest }: IconProps & { open?: boolean }) {
  return (
    <Base viewBox="0 0 16 16" label={open ? "Open folder" : "Folder"} {...rest}>
      <path fill="#00acc1" d={open ? FOLDER_OPEN : FOLDER_CLOSED} />
      <path
        fill="#80deea"
        d="M11.5 12.075A1.6 1.6 0 0 1 9.882 10.5a1.62 1.62 0 1 1 1.62 1.575m3.437-1.138a4 4 0 0 0 .032-.438 4 4 0 0 0-.032-.45l.976-.733a.223.223 0 0 0 .056-.288l-.926-1.556a.23.23 0 0 0-.283-.1l-1.15.45a3.4 3.4 0 0 0-.783-.44l-.171-1.193A.23.23 0 0 0 12.425 6h-1.85a.23.23 0 0 0-.231.189l-.171 1.193a3.4 3.4 0 0 0-.781.44l-1.152-.45a.23.23 0 0 0-.282.1l-.926 1.556a.22.22 0 0 0 .056.288l.975.734a4 4 0 0 0-.032.45 4 4 0 0 0 .032.437l-.975.746a.22.22 0 0 0-.056.288l.925 1.558a.235.235 0 0 0 .283.099l1.152-.455a3.2 3.2 0 0 0 .781.446l.171 1.192a.23.23 0 0 0 .232.189h1.85a.23.23 0 0 0 .232-.189l.17-1.192a3.4 3.4 0 0 0 .783-.446l1.15.455a.24.24 0 0 0 .284-.1l.924-1.557a.223.223 0 0 0-.055-.288Z"
      />
    </Base>
  );
}
