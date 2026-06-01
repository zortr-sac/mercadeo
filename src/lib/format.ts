import { formatDistanceToNow, format, isAfter } from "date-fns";
import { es } from "date-fns/locale";

/** Fecha relativa en español ("hace 2 días"). */
export function relativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

/** Fecha legible ("12 de julio de 2026"). */
export function longDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy", { locale: es });
}

/** Fecha y hora de evento ("12 jul, 15:00"). */
export function eventDate(iso: string): string {
  return format(new Date(iso), "d MMM, HH:mm", { locale: es });
}

/** ¿La fecha es futura respecto a ahora? */
export function isUpcoming(iso: string): boolean {
  return isAfter(new Date(iso), new Date());
}

/** Convierte minutos a etiqueta legible ("1 h 5 min"). */
export function minutesLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
