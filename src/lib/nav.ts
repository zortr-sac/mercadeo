import {
  GraduationCap,
  Home,
  Newspaper,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Coincidencia por prefijo para resaltar la sección activa. */
  match: string;
}

/** Navegación principal (bottom nav móvil + sidebar desktop). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: ROUTES.home, icon: Home, match: "/" },
  { label: "Feed", href: ROUTES.feed, icon: Newspaper, match: "/feed" },
  {
    label: "Academia",
    href: ROUTES.academia,
    icon: GraduationCap,
    match: "/academia",
  },
  {
    label: "Duplicación",
    href: ROUTES.duplicacion,
    icon: Rocket,
    match: "/duplicacion",
  },
];

/** Determina si una ruta está activa para un item de navegación. */
export function isActive(pathname: string, item: NavItem): boolean {
  if (item.match === "/") return pathname === "/";
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
