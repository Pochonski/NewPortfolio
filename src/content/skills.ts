export type SkillLevel = "familiar" | "proficient" | "expert";

export interface Skill {
  name: string;
  level: SkillLevel;
  years: number;
}

export const skills: Record<"frontend" | "backend" | "tools", Skill[]> = {
  frontend: [
    { name: "React", level: "expert", years: 3 },
    { name: "Next.js", level: "expert", years: 2 },
    { name: "TypeScript", level: "proficient", years: 2 },
    { name: "Tailwind CSS", level: "expert", years: 3 },
    { name: "HTML5 / CSS3", level: "expert", years: 4 },
  ],
  backend: [
    { name: "Node.js", level: "proficient", years: 2 },
    { name: "Supabase / PostgreSQL", level: "proficient", years: 2 },
    { name: "Python", level: "proficient", years: 2 },
    { name: "Azure", level: "proficient", years: 1 },
    { name: "REST / RLS", level: "proficient", years: 2 },
  ],
  tools: [
    { name: "Git / GitHub", level: "expert", years: 4 },
    { name: "Vercel CI/CD", level: "expert", years: 2 },
    { name: "Vite", level: "proficient", years: 2 },
    { name: "Jira / Agile", level: "proficient", years: 1 },
  ],
};
