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
      es: "Unificar datos en vivo de múltiples competiciones, tickets de apuestas en screenshots y consultas en español natural en un solo producto rápido y barato de operar.",
      en: "Unify live multi-competition data, bet tickets from screenshots and natural Spanish queries in one fast, cheap-to-run product.",
    },
    solution: {
      es: "PostgreSQL compartido en Supabase como fuente única; ETL cron con 20 jobs hacia 365scores; OCR con Tesseract.js en cliente; NLU con Gemini 2.5 Flash solo para intención+entidades; dashboard React con ISR y realtime solo donde aporta.",
      en: "Shared Supabase PostgreSQL as single source; cron ETL with 20 jobs to 365scores; client-side OCR with Tesseract.js; Gemini 2.5 Flash only for intent+entities; React dashboard with ISR and realtime only where it pays off.",
    },
    results: {
      es: [
        "3 superficies (bot, dashboard, admin) sobre una sola DB sin duplicar lógica",
        "Sync programada observable y reintentable en lugar de polling desde cliente",
        "OCR + NLU reducen el tiempo de consultar un partido o ticket a segundos",
      ],
      en: [
        "3 surfaces (bot, dashboard, admin) on a single DB with no duplicated logic",
        "Observable, retryable scheduled sync instead of client polling",
        "OCR + NLU cut match/ticket lookup time to seconds",
      ],
    },
  },
  stickerhub: {
    slug: "stickerhub",
    challenge: {
      es: "Recrear la emoción del álbum Panini físico (flipbook, sobres, intercambios) en web con 871 jugadores reales y trades justos en tiempo real, en 6 semanas y equipo de 2.",
      en: "Recreate the physical Panini album thrill (flipbook, packs, trading) on web with 871 real players and fair realtime trades, in 6 weeks with a 2-person team.",
    },
    solution: {
      es: "Next.js 16 + TypeScript + Supabase (Auth magic-link + RLS); apertura de sobres con probabilidades auditables; marketplace con transacción atómica; persistencia dual Supabase+localStorage para invitados; Jira + CI/CD en cada PR.",
      en: "Next.js 16 + TypeScript + Supabase (magic-link auth + RLS); pack opening with auditable odds; atomic-transaction marketplace; dual Supabase+localStorage persistence for guests; Jira + CI/CD on every PR.",
    },
    results: {
      es: [
        "871 jugadores / 48 equipos modelados y navegables",
        "Trades atómicos sin duplicación de cromos",
        "Ciclo ágil completo entregado como proyecto final del TEC",
      ],
      en: [
        "871 players / 48 teams modeled and browsable",
        "Atomic trades with no duplicate cards",
        "Full agile cycle shipped as TEC final project",
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
};
