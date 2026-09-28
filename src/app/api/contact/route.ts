import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations";
import { getClientIp, rateLimit, verifyCaptcha } from "@/lib/security";

const RATE_WINDOW_MS = 60_000;

function sanitizeName(name: string): string {
  return name.replace(/[\r\n]+/g, " ").slice(0, 100);
}

export async function POST(req: Request) {
  try {
    // Same-origin POSTs only: browsers always send Origin on POST. Requests
    // without Origin (curl, server-to-server) are allowed; mismatched hosts
    // are rejected to block naive cross-site form abuse.
    const origin = req.headers.get("origin");
    if (origin) {
      try {
        const host = req.headers.get("host") ?? "";
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: "forbidden" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    const ip = getClientIp(req);
    if (!rateLimit(`contact:${ip}`, 5, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const { name, email, message, website, startedAt, captchaToken, locale } = parsed.data;
    const bodyLocale = locale ?? "es";
    const safeName = sanitizeName(name);

    if (website) return NextResponse.json({ ok: true });
    if (startedAt && Date.now() - startedAt < 2500) {
      return NextResponse.json({ error: "too_fast" }, { status: 400 });
    }
    if (!(await verifyCaptcha(captchaToken))) {
      return NextResponse.json({ error: "captcha" }, { status: 403 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO ?? (process.env.NODE_ENV !== "production" ? "joseph19102005@gmail.com" : undefined);
    const from = process.env.CONTACT_FROM ?? (process.env.NODE_ENV !== "production" ? "Portfolio <onboarding@resend.dev>" : undefined);
    if (!apiKey) {
      console.warn("RESEND_API_KEY missing — contact message dropped", { emailDomain: email.split("@")[1] });
      return NextResponse.json({ error: "misconfigured" }, { status: 500 });
    }
    if (!to || !from) {
      console.warn("CONTACT_TO/FROM missing in production — contact message dropped");
      return NextResponse.json({ error: "misconfigured" }, { status: 500 });
    }

    // `safeName` (sanitizeName above) strips CR/LF: `name` is interpolated
    // into the mail subject header.
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: bodyLocale === "en" ? `Portfolio — message from ${safeName}` : `Portfolio — mensaje de ${safeName}`,
      text: `De: ${safeName} <${email}>\n\n${message}`,
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
