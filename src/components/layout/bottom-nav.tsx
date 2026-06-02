"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { ROUTES } from "@/lib/constants";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const user = useSession();
  const items = NAV_ITEMS.filter((item) =>
    item.href === ROUTES.admin ? user.role === "admin" : true,
  ).slice(0, 4);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 font-medium transition-colors",
                active ? "text-brand-700" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "scale-110")} />
              <span className="text-base leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
