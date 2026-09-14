import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(100),
  message: z.string().trim().min(10).max(1000),
  website: z.string().max(0).optional(), // honeypot debe ir vacío
  startedAt: z.coerce.number().optional(), // time-trap
  captchaToken: z.string().max(2048).optional(), // Turnstile (opcional)
});

export type ContactInput = z.infer<typeof contactSchema>;
