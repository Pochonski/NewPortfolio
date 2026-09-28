import { describe, expect, it } from "vitest";
import { contactSchema } from "./validations";

const base = {
  name: "Joseph",
  email: "Test@Example.com",
  message: "Hello, I have a project for you.",
};

describe("contactSchema", () => {
  it("accepts a valid payload and normalizes email", () => {
    const parsed = contactSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("test@example.com");
  });

  it("rejects names with line breaks (header injection)", () => {
    expect(contactSchema.safeParse({ ...base, name: "a\nBcc: x" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, name: "a\rb" }).success).toBe(false);
  });

  it("allows honeypot up to 100 chars so bots stay silent", () => {
    expect(contactSchema.safeParse({ ...base, website: "spam" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, website: "x".repeat(101) }).success).toBe(false);
  });

  it("validates locale enum", () => {
    expect(contactSchema.safeParse({ ...base, locale: "en" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, locale: "fr" }).success).toBe(false);
  });
});
