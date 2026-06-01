"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Navegación inferior (solo móvil/tablet). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors",
                active ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
