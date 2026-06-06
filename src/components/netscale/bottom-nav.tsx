"use client";
// NetScale bottom navigation — ported from prototipo/ui.jsx BottomNav,
// adapted to Next.js routing (usePathname + Link). 5 fixed tabs.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { ROUTES } from "@/lib/constants";

type NavItem = { id: string; label: string; icon: IconName; href: string; match: (p: string) => boolean };

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Inicio", icon: "home", href: ROUTES.home, match: (p) => p === "/" },
  { id: "academia", label: "Academia", icon: "cap", href: ROUTES.academia, match: (p) => p.startsWith("/academia") },
  { id: "crear", label: "Crear", icon: "sparkles", href: ROUTES.crear, match: (p) => p.startsWith("/crear") },
  { id: "vender", label: "Vender", icon: "chat", href: ROUTES.vender, match: (p) => p.startsWith("/vender") },
  {
    id: "perfil", label: "Perfil", icon: "user", href: ROUTES.perfil,
    match: (p) => p.startsWith("/perfil") || p.startsWith("/progreso") || p.startsWith("/audiolibros"),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav style={{
      flexShrink: 0, display: "flex", background: "var(--surface)",
      borderTop: "1px solid var(--border)", boxShadow: "var(--shadow-nav)",
      paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)",
    }}>
      {NAV_ITEMS.map((it) => {
        const on = it.match(pathname);
        return (
          <Link key={it.id} href={it.href} style={{
            flex: 1, minHeight: 64, padding: "8px 2px 6px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            textDecoration: "none",
            color: on ? "var(--blue)" : "var(--text-2)",
          }}>
            <Icon name={it.icon} size={26} strokeWidth={on ? 2.4 : 2}
              color={on ? "var(--blue)" : "var(--text-2)"} />
            <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, letterSpacing: "-.01em" }}>
              {it.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
