import { Briefcase, Package, Rocket, type LucideIcon } from "lucide-react";

/** Mapa de nombres de icono (desde datos) a componentes lucide. */
const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Package,
  Rocket,
};

/** Resuelve un icono por nombre, con Rocket como fallback. */
export function resolveIcon(name: string): LucideIcon {
  return ICONS[name] ?? Rocket;
}
