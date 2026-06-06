import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TokenUsage } from "@/lib/ai/gemini";
import { AI_MONTHLY_BUDGET_PEN, computeCost } from "@/lib/ai/pricing";

/**
 * Medición y control del presupuesto mensual de IA por usuario.
 *
 * El ledger `ai_usage` se escribe SOLO con el cliente service-role (los miembros no
 * tienen permiso de escritura por RLS), así el costo no se puede falsear. El mes de
 * cobro se calcula en hora de Lima (Perú, UTC-5 sin horario de verano).
 */

function limaParts(date = new Date()): { y: string; m: string } {
  // en-CA formatea como YYYY-MM-DD.
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const [y, m] = s.split("-");
  return { y, m };
}

/** Clave del mes actual en Lima, formato 'YYYY-MM'. */
export function limaMonthKey(date = new Date()): string {
  const { y, m } = limaParts(date);
  return `${y}-${m}`;
}

/** Inicio del mes actual (00:00 Lima = 05:00 UTC) en ISO, para filtrar `created_at`. */
export function limaMonthStartISO(date = new Date()): string {
  const { y, m } = limaParts(date);
  return `${y}-${m}-01T05:00:00.000Z`;
}

/** Costo total (soles) gastado por el usuario en el mes actual. */
export async function getMonthlySpendPen(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_usage")
    .select("cost_pen")
    .eq("user_id", userId)
    .gte("created_at", limaMonthStartISO());
  if (error) {
    console.warn("[usage] getMonthlySpendPen:", error.message);
    return 0;
  }
  return (data ?? []).reduce((sum, row) => sum + Number(row.cost_pen ?? 0), 0);
}

/** Límite efectivo del mes: override del admin (si existe) o el default (S/25). */
export async function getEffectiveLimitPen(
  businessId: string | null,
  userId: string,
): Promise<number> {
  const admin = createAdminClient();
  let query = admin
    .from("ai_limit_overrides")
    .select("limit_pen")
    .eq("user_id", userId)
    .eq("year_month", limaMonthKey());
  if (businessId) query = query.eq("business_id", businessId);
  const { data } = await query.maybeSingle();
  if (data && data.limit_pen != null) return Number(data.limit_pen);
  return AI_MONTHLY_BUDGET_PEN;
}

/** Chequea si el usuario aún tiene presupuesto. Bloquea cuando ya alcanzó el límite. */
export async function assertWithinBudget(
  businessId: string | null,
  userId: string,
): Promise<{ ok: boolean; spentPen: number; limitPen: number }> {
  const [spentPen, limitPen] = await Promise.all([
    getMonthlySpendPen(userId),
    getEffectiveLimitPen(businessId, userId),
  ]);
  return { ok: spentPen < limitPen, spentPen, limitPen };
}

/** Registra el costo real de una generación (no bloquea el flujo si falla). */
export async function recordAiUsage(params: {
  businessId: string | null;
  userId: string;
  endpoint: string;
  model: string;
  usage: TokenUsage;
  idempotencyKey?: string | null;
}): Promise<void> {
  try {
    const cost = computeCost({
      model: params.model,
      inputTokens: params.usage.inputTokens,
      outputTokens: params.usage.outputTokens,
    });
    const admin = createAdminClient();
    await admin.from("ai_usage").upsert(
      {
        business_id: params.businessId,
        user_id: params.userId,
        endpoint: params.endpoint,
        model: params.model,
        input_tokens: params.usage.inputTokens,
        output_tokens: params.usage.outputTokens,
        total_tokens: params.usage.totalTokens,
        cost_usd: cost.costUsd,
        pen_per_usd: cost.ratePen,
        safety_factor: cost.factor,
        cost_pen: cost.costPen,
        idempotency_key: params.idempotencyKey ?? null,
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true },
    );
  } catch (e) {
    console.warn("[usage] recordAiUsage failed:", e);
  }
}
