import { KIND_COLORS, type IdeFile } from "@/lib/files";

export function FileIcon({ file, size = 16 }: { file: IdeFile; size?: number }) {
  const color = KIND_COLORS[file.kind];
  const letter = file.kind.toUpperCase().slice(0, 2);
  return (
    <span
      aria-hidden
      style={{ color, width: size, height: size, fontSize: size * 0.52 }}
      className="inline-flex shrink-0 items-center justify-center rounded-[3px] border font-mono font-bold"
    >
      {letter}
    </span>
  );
}
