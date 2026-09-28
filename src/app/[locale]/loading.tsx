export default function LocaleLoading() {
  return (
    <div
      className="flex h-full w-full items-center justify-center p-8"
      role="status"
      aria-label="Loading"
      style={{ background: "var(--ide-bg)" }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--ide-border)", borderTopColor: "var(--ide-accent)" }}
        aria-hidden
      />
    </div>
  );
}
