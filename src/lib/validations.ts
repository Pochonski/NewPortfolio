import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[^\r\n]*$/, "name must not contain line breaks"),
  email: z.string().trim().toLowerCase().email().max(100),
  message: z.string().trim().min(10).max(1000),
  website: z.string().max(100).optional(), // honeypot: must stay empty, checked silently in route
  startedAt: z.coerce.number().optional(), // time-trap
  captchaToken: z.string().max(2048).optional(), // Turnstile (opcional)
  locale: z.enum(["es", "en"]).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
