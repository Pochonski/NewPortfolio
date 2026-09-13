import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Star, GitFork, ExternalLink } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { EditorPage } from "@/components/ide/EditorPage";
import { githubMd } from "@/lib/file-sources";
import { highlightCode } from "@/lib/shiki";
import { getGithubData } from "@/lib/github";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "github.md",
    description:
      locale === "en"
        ? "Profile and repositories of @Pochonski on GitHub."
        : "Perfil y repositorios de @Pochonski en GitHub.",
  };
}

export default async function GithubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const data = await getGithubData();
  const src = githubMd(locale);

  return (
    <EditorPage
      route="/github"
      title="GitHub — @Pochonski"
      initialSource={{ fileId: "github", code: src.code, codeHtml: await highlightCode(src.code, src.shikiLang) }}
    >
      {!data ? (
        <div className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--ide-border)", color: "var(--ide-fg)" }}>
          GitHub API unavailable right now —{" "}
          <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--ide-accent)" }}>
            open profile directly
          </a>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image src={data.user.avatar_url} alt={data.user.login} width={64} height={64} className="rounded-full border" />
            <div>
              <p className="text-lg font-semibold" style={{ color: "var(--ide-fg-bright)" }}>@{data.user.login}</p>
              <p className="font-mono text-xs" style={{ color: "var(--ide-fg-dim)" }}>
                {data.user.public_repos} repos · {data.user.followers} followers
              </p>
            </div>
            <a href="https://github.com/Pochonski" target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium" style={{ borderColor: "var(--ide-accent)", color: "var(--ide-accent)" }}>
              Profile <ExternalLink size={13} />
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.repos.map((r) => (
              <a key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border p-4 transition-transform hover:-translate-y-0.5" style={{ borderColor: "var(--ide-border)", background: "var(--ide-terminal)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--ide-accent)" }}>{r.name}</p>
                {r.description && <p className="mt-1 line-clamp-2 text-[13px]" style={{ color: "var(--ide-fg)" }}>{r.description}</p>}
                <p className="mt-3 flex items-center gap-4 font-mono text-[11px]" style={{ color: "var(--ide-fg-dim)" }}>
                  {r.language && <span>{r.language}</span>}
                  <span className="flex items-center gap-1"><Star size={11} /> {r.stargazers_count}</span>
                  <span className="flex items-center gap-1"><GitFork size={11} /> {r.forks}</span>
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </EditorPage>
  );
}
