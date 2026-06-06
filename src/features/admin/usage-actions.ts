"use server";
import { getRepositories } from "@/data";
import { requireBusinessAdmin } from "@/lib/session";
import { currentMonthKey } from "./usage-metrics";

/**
 * Fija el límite de gasto de IA (soles) de un usuario para el MES ACTUAL.
 * El mes siguiente vuelve al límite por defecto automáticamente.
 */
export async function setUserLimitAction(input: {
  businessId: string;
  userId: string;
  limitPen: number;
}): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireBusinessAdmin(input.businessId);
  const limit = Number(input.limitPen);
  if (!Number.isFinite(limit) || limit < 0 || limit > 100_000) {
    return { ok: false, error: "Monto inválido" };
  }
  try {
    await getRepositories().usage.setLimitOverride({
      businessId: input.businessId,
      userId: input.userId,
      monthKey: currentMonthKey(),
      limitPen: Math.round(limit * 100) / 100,
      updatedBy: admin.id,
    });
    return { ok: true };
  } catch (e) {
    console.warn("[usage] setUserLimitAction:", e);
    return { ok: false, error: "No se pudo guardar" };
  }
}
