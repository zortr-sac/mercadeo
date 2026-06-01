"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/components/session-provider";
import { Brand } from "@/components/layout/brand";
import { ROLE_LABELS, ROUTES } from "@/lib/constants";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Barra lateral (solo escritorio). */
export function Sidebar() {
  const pathname = usePathname();
  const user = useSession();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="p-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href={ROUTES.perfil}
        className="m-3 flex items-center gap-3 rounded-[var(--radius-lg)] border border-border p-3 transition-colors hover:bg-muted"
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
      </Link>
    </aside>
  );
}
