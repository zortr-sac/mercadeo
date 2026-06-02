import {
  Bell,
  GraduationCap,
  Home,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  Users,
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
    label: "Mensajes",
    href: ROUTES.mensajes,
    icon: MessageCircle,
    match: "/mensajes",
  },
  {
    label: "Prospectos",
    href: ROUTES.prospectos,
    icon: Users,
    match: "/duplicacion/prospectos",
  },
  {
    label: "Academia",
    href: ROUTES.academia,
    icon: GraduationCap,
    match: "/academia",
  },
  {
    label: "Admin",
    href: ROUTES.admin,
    icon: ShieldCheck,
    match: "/admin",
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "Novedades", href: ROUTES.feed, icon: Newspaper, match: "/feed" },
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
