import {
  Bell,
  GraduationCap,
  Headphones,
  Home,
  Megaphone,
  Presentation,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match: string;
}

/** Navegacion principal para cliente y admin. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: ROUTES.home, icon: Home, match: "/" },
  {
    label: "Academia",
    href: ROUTES.academia,
    icon: GraduationCap,
    match: "/academia",
  },
  {
    label: "Vender",
    href: ROUTES.vender,
    icon: Megaphone,
    match: "/vender",
  },
  {
    label: "Presentar",
    href: ROUTES.presentar,
    icon: Presentation,
    match: "/presentar",
  },
  {
    label: "Audiolibros",
    href: ROUTES.audiolibros,
    icon: Headphones,
    match: "/audiolibros",
  },
  {
    label: "Admin",
    href: ROUTES.admin,
    icon: ShieldCheck,
    match: "/admin",
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Recordatorios",
    href: ROUTES.constancia,
    icon: Bell,
    match: "/constancia",
  },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.match === "/") return pathname === "/";
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
