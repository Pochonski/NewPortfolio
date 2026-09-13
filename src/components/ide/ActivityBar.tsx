"use client";

import { useEffect, useState } from "react";
import {
  Files,
  Search,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Star,
  Mail,
  Settings,
  Github,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export type SidebarView = "files" | "search";

export function setSidebarView(view: SidebarView) {
  window.dispatchEvent(new CustomEvent("porto-sidebar", { detail: { view } }));
}

const TOP = [
  { Icon: Files, route: "/", key: "home" },
  { Icon: User, route: "/about", key: "about" },
  { Icon: Briefcase, route: "/experience", key: "experience" },
  { Icon: GraduationCap, route: "/studies", key: "studies" },
  { Icon: FolderGit2, route: "/projects", key: "projects" },
  { Icon: Star, route: "/skills", key: "skills" },
  { Icon: Github, route: "/github", key: "github" },
  { Icon: Mail, route: "/contact", key: "contact" },
] as const;

export function ActivityBar() {
  const t = useTranslations("ide.activity");
  const pathname = usePathname();
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
  const [view, setView] = useState<SidebarView>("files");

  useEffect(() => {
    const h = (e: Event) => {
      const v = (e as CustomEvent).detail?.view;
      if (v === "files" || v === "search") setView(v);
    };
    window.addEventListener("porto-sidebar", h as EventListener);
    return () => window.removeEventListener("porto-sidebar", h as EventListener);
  }, []);

  return (
    <aside
      aria-label={t("bar")}
      className="flex w-11 shrink-0 flex-col items-center justify-between border-r py-2 max-md:fixed max-md:inset-x-0 max-md:bottom-6 max-md:z-30 max-md:mx-3 max-md:w-auto max-md:flex-row max-md:rounded-xl max-md:border max-md:py-1.5 max-md:px-2"
      style={{ background: "var(--ide-sidebar)", borderColor: "var(--ide-border)" }}
    >
      <div className="flex flex-col items-center gap-0.5 max-md:flex-row max-md:gap-1">
        {TOP.map(({ Icon, route, key }) => {
          const active = clean === route;
          const label = t(key);
          return (
            <Link
              key={route}
              href={route as "/"}
              onClick={() => setSidebarView("files")}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative rounded-md p-2 transition-opacity"
              style={{ opacity: active ? 1 : 0.55 }}
            >
              <span
                aria-hidden
                className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full max-md:hidden"
                style={{ background: active ? "var(--ide-sidebar-active)" : "transparent" }}
              />
              <Icon size={19} style={{ color: active ? "var(--ide-sidebar-active)" : "var(--ide-fg)" }} />
            </Link>
          );
        })}
        <button
          onClick={() => setSidebarView("search")}
          title={t("searchHint")}
          aria-label={t("search")}
          className="relative rounded-md p-2 transition-opacity"
          style={{ opacity: view === "search" ? 1 : 0.55 }}
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full max-md:hidden"
            style={{ background: view === "search" ? "var(--ide-sidebar-active)" : "transparent" }}
          />
          <Search size={19} style={{ color: view === "search" ? "var(--ide-sidebar-active)" : "var(--ide-fg)" }} />
        </button>
      </div>
      <Link
        href="/settings"
        title={t("settings")}
        aria-label={t("settings")}
        aria-current={clean === "/settings" ? "page" : undefined}
        className="rounded-md p-2 max-md:hidden"
        style={{ opacity: clean === "/settings" ? 1 : 0.55 }}
      >
        <Settings size={19} style={{ color: "var(--ide-fg)" }} />
      </Link>
    </aside>
  );
}
