import "server-only";
import type { AiUsageRow } from "@/data/repositories";

/**
 * Agregación de consumo de IA para el panel admin. Calcula gasto por usuario,
 * por función, series por día (mes actual) y por mes (últimos N), proyección de
 * fin de mes y comparativo con el mes anterior. Hora de Lima (UTC-5, sin DST).
 * Se ejecuta en el server; el cliente recibe objetos planos.
 */

const LIMA_OFFSET_MS = 5 * 60 * 60 * 1000;
const MONTH_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTH_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Etiquetas legibles de cada función de IA (endpoint). */
export const ENDPOINT_LABELS: Record<string, string> = {
  message: "Mensajes",
  conversation: "Copiloto",
  presentation: "Presentaciones",
  flyer: "Imágenes",
  reframe: "Ánimo",
};

/** Desplaza una fecha a "hora Lima" para leer sus partes con los getters UTC. */
function limaShift(iso: string): Date {
  return new Date(new Date(iso).getTime() - LIMA_OFFSET_MS);
}

export interface DayPoint {
  label: string;
  costPen: number;
}
export interface MonthPoint {
  label: string;
  key: string;
  costPen: number;
}
export interface EndpointSlice {
  key: string;
  label: string;
  costPen: number;
  count: number;
}
export interface UserMetric {
  userId: string;
  costPen: number;
  count: number;
  daily: DayPoint[];
  monthly: MonthPoint[];
}
export interface UsageMetrics {
  monthKey: string;
  monthLabel: string;
  totalPen: number;
  totalCount: number;
  daysInMonth: number;
  dayOfMonth: number;
  /** Proyección de gasto a fin de mes al ritmo actual (run-rate). */
  projectedPen: number;
  /** Total del mes anterior (para el comparativo). */
  prevMonthTotalPen: number;
  /** Miembros distintos que usaron IA este mes. */
  activeUsers: number;
  /** Gasto por función este mes, ordenado de mayor a menor. */
  byEndpoint: EndpointSlice[];
  business: { daily: DayPoint[]; monthly: MonthPoint[] };
  byUser: Record<string, UserMetric>;
}

/** Clave 'YYYY-MM' del mes actual en Lima. */
export function currentMonthKey(): string {
  const lima = new Date(Date.now() - LIMA_OFFSET_MS);
  return `${lima.getUTCFullYear()}-${String(lima.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Inicio (ISO UTC) del primer día del mes que está `monthsBack` meses atrás (00:00 Lima). */
export function usageWindowStartISO(monthsBack = 5): string {
  const lima = new Date(Date.now() - LIMA_OFFSET_MS);
  return new Date(
    Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth() - monthsBack, 1) + LIMA_OFFSET_MS,
  ).toISOString();
}

export function buildUsageMetrics(rows: AiUsageRow[], months = 6): UsageMetrics {
  const lima = new Date(Date.now() - LIMA_OFFSET_MS);
  const curY = lima.getUTCFullYear();
  const curM = lima.getUTCMonth(); // 0-based
  const monthKey = `${curY}-${String(curM + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(Date.UTC(curY, curM + 1, 0)).getUTCDate();
  const dayOfMonth = lima.getUTCDate();

  const monthList: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(curY, curM - i, 1));
    monthList.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: MONTH_SHORT[d.getUTCMonth()],
    });
  }

  const emptyDaily = (): DayPoint[] =>
    Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), costPen: 0 }));
  const emptyMonthly = (): MonthPoint[] =>
    monthList.map((m) => ({ label: m.label, key: m.key, costPen: 0 }));

  const business = { daily: emptyDaily(), monthly: emptyMonthly() };
  const byUser: Record<string, UserMetric> = {};
  const endpointMap = new Map<string, { costPen: number; count: number }>();
  const activeSet = new Set<string>();
  let totalPen = 0;
  let totalCount = 0;

  for (const row of rows) {
    const d = limaShift(row.createdAt);
    const rowMonthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const dayIdx = d.getUTCDate() - 1;
    const cost = row.costPen;

    let u = byUser[row.userId];
    if (!u) {
      u = { userId: row.userId, costPen: 0, count: 0, daily: emptyDaily(), monthly: emptyMonthly() };
      byUser[row.userId] = u;
    }

    if (rowMonthKey === monthKey) {
      if (dayIdx >= 0 && dayIdx < daysInMonth) {
        business.daily[dayIdx].costPen += cost;
        u.daily[dayIdx].costPen += cost;
      }
      u.costPen += cost;
      u.count += 1;
      totalPen += cost;
      totalCount += 1;
      activeSet.add(row.userId);
      const e = endpointMap.get(row.endpoint) ?? { costPen: 0, count: 0 };
      e.costPen += cost;
      e.count += 1;
      endpointMap.set(row.endpoint, e);
    }

    const mi = monthList.findIndex((m) => m.key === rowMonthKey);
    if (mi >= 0) {
      business.monthly[mi].costPen += cost;
      u.monthly[mi].costPen += cost;
    }
  }

  const byEndpoint: EndpointSlice[] = [...endpointMap.entries()]
    .map(([key, v]) => ({ key, label: ENDPOINT_LABELS[key] ?? key, costPen: v.costPen, count: v.count }))
    .sort((a, b) => b.costPen - a.costPen);

  const prevMonthTotalPen =
    business.monthly.length >= 2 ? business.monthly[business.monthly.length - 2].costPen : 0;
  const projectedPen = dayOfMonth > 0 ? (totalPen / dayOfMonth) * daysInMonth : totalPen;

  return {
    monthKey,
    monthLabel: `${MONTH_LONG[curM]} ${curY}`,
    totalPen,
    totalCount,
    daysInMonth,
    dayOfMonth,
    projectedPen,
    prevMonthTotalPen,
    activeUsers: activeSet.size,
    byEndpoint,
    business,
    byUser,
  };
}
