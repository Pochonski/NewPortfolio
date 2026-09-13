"use client";

import {
  Files,
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

const TOP = [
  { Icon: Files, route: "/", label: "Explorer / Home" },
  { Icon: User, route: "/about", label: "About" },
  { Icon: Briefcase, route: "/experience", label: "Experience" },
  { Icon: GraduationCap, route: "/studies", label: "Studies" },
  { Icon: FolderGit2, route: "/projects", label: "Projects" },
  { Icon: Star, route: "/skills", label: "Skills" },
  { Icon: Github, route: "/github", label: "GitHub" },
  { Icon: Mail, route: "/contact", label: "Contact" },
];

export function ActivityBar() {
  const pathname = usePathname();
  const clean = pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";

  return (
    <aside
      aria-label="Activity Bar"
      className="flex w-11 shrink-0 flex-col items-center justify-between border-r py-2 max-md:fixed max-md:inset-x-0 max-md:bottom-6 max-md:z-30 max-md:mx-3 max-md:w-auto max-md:flex-row max-md:rounded-xl max-md:border max-md:py-1.5 max-md:px-2"
      style={{ background: "var(--ide-sidebar)", borderColor: "var(--ide-border)" }}
    >
      <div className="flex flex-col items-center gap-0.5 max-md:flex-row max-md:gap-1">
        {TOP.map(({ Icon, route, label }) => {
          const active = clean === route;
          return (
            <Link
              key={route}
              href={route as "/"}
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
      </div>
      <Link
        href="/settings"
        title="Settings"
        aria-label="Settings"
        aria-current={clean === "/settings" ? "page" : undefined}
        className="rounded-md p-2 max-md:hidden"
        style={{ opacity: clean === "/settings" ? 1 : 0.55 }}
      >
        <Settings size={19} style={{ color: "var(--ide-fg)" }} />
      </Link>
    </aside>
  );
}
