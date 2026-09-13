"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [startedAt] = useState(() => Date.now());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, website: "", startedAt }),
      });
      if (!res.ok) throw new Error("send failed");
      setState("ok");
      setForm({ name: "", email: "", message: "" });
      trackEvent("contact_sent");
      window.dispatchEvent(
        new CustomEvent("porto-log", { detail: { message: `Contact message sent from ${form.email}` } })
      );
    } catch {
      setState("error");
      window.dispatchEvent(
        new CustomEvent("porto-log", { detail: { message: "Contact message failed to send" } })
      );
    }
  }

  const input = {
    background: "var(--ide-terminal)",
    borderColor: "var(--ide-border)",
    color: "var(--ide-fg-bright)",
  } as React.CSSProperties;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span style={{ color: "var(--ide-fg)" }}>{t("name")}</span>
        <input
          required
          minLength={2}
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("namePlaceholder")}
          className="rounded-md border px-3 py-2.5 outline-none placeholder:opacity-50 focus:border-[var(--ide-accent)]"
          style={input}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span style={{ color: "var(--ide-fg)" }}>{t("email")}</span>
        <input
          required
          type="email"
          maxLength={100}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t("emailPlaceholder")}
          className="rounded-md border px-3 py-2.5 outline-none placeholder:opacity-50 focus:border-[var(--ide-accent)]"
          style={input}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px]">
        <span style={{ color: "var(--ide-fg)" }}>{t("message")}</span>
        <textarea
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder={t("messagePlaceholder")}
          className="resize-none rounded-md border px-3 py-2.5 outline-none placeholder:opacity-50 focus:border-[var(--ide-accent)]"
          style={input}
        />
      </label>
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-md px-5 py-3 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--ide-button)", color: "var(--ide-button-fg)" }}
      >
        {state === "sending" ? t("sending") : t("send")}
      </button>
      {state === "ok" && (
        <p role="status" className="text-sm" style={{ color: "var(--ide-success)" }}>
          {t("success")}
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-sm" style={{ color: "var(--ide-error)" }}>
          {t("error")}
        </p>
      )}
    </form>
  );
}
