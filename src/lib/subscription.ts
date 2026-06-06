import { SUBSCRIPTION } from "@/lib/constants";
import type { SubscriptionState } from "@/data/types";

/**
 * Lógica pura de suscripción (sin I/O). El estado es DERIVADO de la fecha de
 * vencimiento: no se guarda ninguna columna "status" en la base de datos.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** true si la suscripción ya venció. null (sin suscripción) NO cuenta como vencida. */
export function isExpired(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < now.getTime();
}

/**
 * Días enteros que faltan para el vencimiento (negativo si ya venció).
 * Infinity si no hay suscripción (null).
 */
export function daysUntilExpiry(expiresAt: string | null, now: Date = new Date()): number {
  if (!expiresAt) return Number.POSITIVE_INFINITY;
  const diff = new Date(expiresAt).getTime() - now.getTime();
  return Math.ceil(diff / DAY_MS);
}

/** Estado derivado para badges del panel admin y para el bloqueo por impago. */
export function getSubscriptionState(
  expiresAt: string | null,
  now: Date = new Date(),
): SubscriptionState {
  if (!expiresAt) return "none";
  if (isExpired(expiresAt, now)) return "expired";
  if (daysUntilExpiry(expiresAt, now) <= SUBSCRIPTION.expiringSoonDays) return "expiring_soon";
  return "active";
}

/**
 * Etiqueta humana del vencimiento, en hora de Perú. La zona horaria se fija para
 * que el texto sea idéntico en el servidor (UTC) y en el cliente, evitando el
 * desajuste de hidratación (React #418). Calcúlala en el server y pásala como prop.
 */
export function formatExpiryLabel(expiresAt: string | null, now: Date = new Date()): string {
  if (!expiresAt) return "Sin fecha de vencimiento asignada";
  const days = daysUntilExpiry(expiresAt, now);
  const date = new Date(expiresAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Lima",
  });
  if (days < 0) return `Venció el ${date} · hace ${Math.abs(days)} día(s)`;
  if (days === 0) return `Vence hoy · ${date}`;
  if (days === 1) return `Vence mañana · ${date}`;
  return `Vence en ${days} días · ${date}`;
}

/**
 * Nueva fecha de vencimiento tras registrar un pago, SIN perder días:
 * - si la suscripción sigue vigente (vence en el futuro), suma el período sobre ESA
 *   fecha (el cliente no pierde los días que aún le quedaban);
 * - si ya venció o el cliente no tenía suscripción, cuenta el período desde `now`.
 *
 * DECISIÓN DE NEGOCIO (ajustable): el período se calcula como `periodMonths * 30 días`,
 * que es predecible y sin sorpresas de fin de mes. Si prefieres meses de calendario
 * reales (p. ej. del 15 de enero al 15 de febrero), reemplaza el cálculo de `periodMs`
 * por una suma con `base.setMonth(base.getMonth() + SUBSCRIPTION.periodMonths)`.
 */
export function computeRenewedExpiry(
  currentExpiresAt: string | null,
  now: Date = new Date(),
): string {
  const periodMs = SUBSCRIPTION.periodMonths * 30 * DAY_MS;
  const current = currentExpiresAt ? new Date(currentExpiresAt) : null;
  const base = current && current.getTime() > now.getTime() ? current : now;
  return new Date(base.getTime() + periodMs).toISOString();
}
