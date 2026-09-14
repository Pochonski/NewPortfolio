import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations";
import { rateLimit, verifyCaptcha } from "@/lib/security";

const RATE_WINDOW_MS = 60_000;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(`contact:${ip}`, 5, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
    }

    const body = await req.json();
    const bodyLocale = body?.locale === "en" ? "en" : "es";
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const { name, email, message, website, startedAt, captchaToken } = parsed.data;

    if (website) return NextResponse.json({ ok: true });
    if (startedAt && Date.now() - startedAt < 2500) {
      return NextResponse.json({ error: "too_fast" }, { status: 400 });
    }
    if (!(await verifyCaptcha(captchaToken))) {
      return NextResponse.json({ error: "captcha" }, { status: 403 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO ?? "joseph19102005@gmail.com";
    const from = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";
    if (!apiKey) {
      console.warn("RESEND_API_KEY missing — contact message dropped", { name, email });
      return NextResponse.json({ error: "misconfigured" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: bodyLocale === "en" ? `Portfolio — message from ${name}` : `Portfolio — mensaje de ${name}`,
      text: `De: ${name} <${email}>\n\n${message}`,
    });
    if (error) {
      console.error("Resend error", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact route error", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
