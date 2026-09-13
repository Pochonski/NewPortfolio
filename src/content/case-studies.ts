export interface CaseStudy {
  slug: string;
  challenge: { es: string; en: string };
  solution: { es: string; en: string };
  results: { es: string[]; en: string[] };
}

export const caseStudies: Record<string, CaseStudy> = {
  scorehub: {
    slug: "scorehub",
    challenge: {
      es: "Sostener muchas competiciones, partidos y noticias en un sitio público rápido y siempre actualizado, con un solo modelo de datos consistente y barato de operar.",
      en: "Sustain many competitions, matches and news on a fast, always-updated public site, with a single consistent data model that stays cheap to run.",
    },
    solution: {
      es: "PostgreSQL en Supabase como fuente única (competiciones, partidos, noticias con RLS); sincronización programada observable con 20 jobs contra fuente externa de datos deportivos más revalidación; sitio público con ISR y realtime para live scores, tablas, brackets y noticias, con canal complementario en Telegram sobre la misma DB.",
      en: "Supabase PostgreSQL as single source (competitions, matches, news with RLS); observable scheduled sync with 20 jobs against an external sports data source plus revalidation; public site with ISR and realtime for live scores, standings, brackets and news, with a complementary Telegram channel on the same DB.",
    },
    results: {
      es: [
        "Sitio público premium siempre actualizado sin polling desde el cliente",
        "Una sola DB alimenta competiciones, partidos, brackets y noticias sin duplicar lógica",
        "Sync programada observable y reintentable más módulo de noticias",
      ],
      en: [
        "Always-updated premium public site with no client-side polling",
        "One DB feeds competitions, matches, brackets and news with no duplicated logic",
        "Observable, retryable scheduled sync plus a news module",
      ],
    },
  },
  "perfumes-el-pocho": {
    slug: "perfumes-el-pocho",
    challenge: {
      es: "Vender perfumes de verdad con catálogo gigante (+4.000 fragancias), sin equipo ni presupuesto: indexar datos, publicar rápido y cerrar ventas por WhatsApp.",
      en: "Sell real perfumes with a giant catalog (4,000+ fragrances), no team no budget: index data, ship fast, close sales via WhatsApp.",
    },
    solution: {
      es: "Scraper Python que normaliza precio/descripción/imagen; Next.js + Tailwind + Framer Motion con búsqueda y fichas ligeras; pedido por WhatsApp con mensaje pre-armado; despliegue Vercel con revalidación.",
      en: "Python scraper normalizing price/description/image; Next.js + Tailwind + Motion with search and light PDPs; WhatsApp order with prefilled message; Vercel deploy with revalidation.",
    },
    results: {
      es: [
        "Negocio real operando y cobrando, no demo",
        "Catálogo de miles de SKUs mantenible por una persona",
        "Conversión directa por WhatsApp sin pasarela costosa",
      ],
      en: [
        "Real business operating and charging, not a demo",
        "Thousands of SKUs maintainable by one person",
        "Direct WhatsApp conversion with no costly gateway",
      ],
    },
  },
  "prestamos-mi-principe": {
    slug: "prestamos-mi-principe",
    challenge: {
      es: "Gestionar cobros de préstamos en Costa Rica con modelo solo-intereses más abonos a capital, para varios cobradores sin que vean datos ajenos, y sin depender de hojas de cálculo.",
      en: "Manage loan collection in Costa Rica with an interest-only plus principal-payments model, for multiple collectors without leaking each other's data, and no spreadsheets.",
    },
    solution: {
      es: "React + Vite + Supabase con arquitectura multi-tenant y Row Level Security por cobrador; calendario de cobros con mora automática; reportes visuales, exportación CSV y respaldo/restauración JSON; despliegue Vercel.",
      en: "React + Vite + Supabase with multi-tenant architecture and per-collector Row Level Security; collection calendar with automatic late fees; visual reports, CSV export and JSON backup/restore; Vercel deploy.",
    },
    results: {
      es: [
        "Aislamiento real de datos por cobrador con RLS, sin backend propio",
        "Mora, saldos y cierres calculados en vez de fórmulas manuales",
        "Respaldo/restauración JSON + CSV para operar sin miedo a perder datos",
      ],
      en: [
        "Real per-collector data isolation with RLS, no custom backend",
        "Late fees, balances and closures computed instead of manual formulas",
        "JSON backup/restore + CSV to operate with no fear of data loss",
      ],
    },
  },
};
