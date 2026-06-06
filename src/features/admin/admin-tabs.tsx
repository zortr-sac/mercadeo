"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CreditCard,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Presentation,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  ADMIN_TABS,
  ADMIN_TAB_LABELS,
  adminBusinessPath,
  type AdminTab,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const TAB_ICONS: Record<AdminTab, LucideIcon> = {
  resumen: LayoutDashboard,
  academia: BookOpen,
  audiolibros: Headphones,
  presentaciones: Presentation,
  mensajes: MessageCircle,
  lideres: Users,
  consumo: Wallet,
  suscripciones: CreditCard,
  ajustes: Settings,
};

/**
 * Rail de pestañas del hub de administración. Resalta la pestaña activa según
 * `usePathname`. Desplazable en móvil; lenguaje claramente administrativo.
 */
export function AdminTabs({
  businessId,
  isPlatformAdmin,
}: {
  businessId: string;
  isPlatformAdmin: boolean;
}) {
  const pathname = usePathname();
  // La gestión de suscripciones es exclusiva del admin de plataforma.
  const tabs = ADMIN_TABS.filter(
    (tab) => tab !== "suscripciones" || isPlatformAdmin,
  );

  return (
    <nav
      aria-label="Secciones de administración"
      className="-mx-1 overflow-x-auto"
    >
      <div className="flex min-w-max gap-1 px-1">
        {tabs.map((tab) => {
          const href = adminBusinessPath(businessId, tab);
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          const Icon = TAB_ICONS[tab];
          return (
            <Link
              key={tab}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border px-4 py-2.5 text-base font-medium transition-colors",
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {ADMIN_TAB_LABELS[tab]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
