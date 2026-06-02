"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/components/session-provider";
import { Brand } from "@/components/layout/brand";
import { ROLE_LABELS, ROUTES } from "@/lib/constants";
import { isActive, NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const user = useSession();
  const mainItems = NAV_ITEMS.filter((item) =>
    item.href === ROUTES.admin ? user.role === "admin" : true,
  );

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="p-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {mainItems.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 pb-2 text-muted-foreground">Soporte diario</p>
          {SECONDARY_NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <Link
        href={ROUTES.perfil}
        className="m-3 flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{user.fullName}</p>
          <p className="truncate text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
      </Link>
    </aside>
  );
}
