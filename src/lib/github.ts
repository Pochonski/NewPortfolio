export interface GithubUser {
  login: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks: number;
  fork: boolean;
  language: string | null;
  pushed_at: string;
}

const USER = "Pochonski";
const GITHUB_API = process.env.GITHUB_API_BASE_URL ?? "https://api.github.com";

function headers() {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function getGithubData(): Promise<{ user: GithubUser; repos: GithubRepo[] } | null> {
  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${USER}`, {
        headers: headers(),
        next: { revalidate: 3600 },
      }),
      fetch(`${GITHUB_API}/users/${USER}/repos?sort=pushed&per_page=6`, {
        headers: headers(),
        next: { revalidate: 3600 },
      }),
    ]);
    if (!userRes.ok || !repoRes.ok) return null;
    const user = (await userRes.json()) as GithubUser;
    const repos = (await repoRes.json()) as GithubRepo[];
    return { user, repos };
  } catch {
    return null;
  }
}
