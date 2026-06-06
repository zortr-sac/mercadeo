import "server-only";

/**
 * Motor de costos de IA. Convierte tokens de Gemini en costo real (USD → soles)
 * para medir el consumo de cada usuario contra su presupuesto mensual.
 *
 * Precios oficiales: https://ai.google.dev/gemini-api/docs/pricing (verificados jun-2026).
 * Si Google cambia tarifas o el dólar se mueve mucho, actualiza SOLO estas constantes;
 * la tarjeta "Costos de referencia" del panel admin las refleja automáticamente.
 */

/** Precio por 1M de tokens (USD) por modelo. */
export const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  "gemini-2.5-flash": { inputPerM: 0.3, outputPerM: 2.5 },
  // La imagen factura la SALIDA a $30/1M tokens (1290 tokens/imagen ≈ $0.039).
  "gemini-2.5-flash-image": { inputPerM: 0.3, outputPerM: 30 },
  "gemini-2.5-flash-lite": { inputPerM: 0.1, outputPerM: 0.4 },
};

const FALLBACK_PRICING = MODEL_PRICING["gemini-2.5-flash"];

/**
 * Tipo de cambio conservador (spot ~3.4) + colchón de seguridad, para que el costo
 * de los tokens nunca salga del bolsillo del negocio si el dólar sube o Google
 * ajusta precios. El margen de ganancia (S/5) queda intacto.
 */
export const USD_TO_PEN = 3.7;
export const SAFETY_MULTIPLIER = 1.15;

/** Presupuesto por defecto de costo real de IA por usuario y mes (soles). */
export const AI_MONTHLY_BUDGET_PEN = 25;

export interface CostBreakdown {
  costUsd: number;
  ratePen: number; // USD_TO_PEN usado (congelado en el registro)
  factor: number; // SAFETY_MULTIPLIER usado (congelado en el registro)
  costPen: number; // costo cobrado contra el presupuesto
}

export function computeCost(params: {
  model: string;
  inputTokens: number;
  outputTokens: number;
}): CostBreakdown {
  const price = MODEL_PRICING[params.model] ?? FALLBACK_PRICING;
  const costUsd =
    (params.inputTokens * price.inputPerM + params.outputTokens * price.outputPerM) / 1_000_000;
  const costPen = costUsd * USD_TO_PEN * SAFETY_MULTIPLIER;
  return { costUsd, ratePen: USD_TO_PEN, factor: SAFETY_MULTIPLIER, costPen };
}

/**
 * Objeto serializable para mostrar los precios (solo lectura) en el panel admin.
 * La página server lo pasa como prop al dashboard cliente (no importar este módulo
 * server-only desde el cliente).
 */
export const PRICING_DISPLAY = {
  model: "gemini-2.5-flash",
  inputPerM: MODEL_PRICING["gemini-2.5-flash"].inputPerM,
  outputPerM: MODEL_PRICING["gemini-2.5-flash"].outputPerM,
  imagePerImage: 0.039,
  imageTokens: 1290,
  usdToPen: USD_TO_PEN,
  safetyMultiplier: SAFETY_MULTIPLIER,
  monthlyBudgetPen: AI_MONTHLY_BUDGET_PEN,
} as const;

export type PricingDisplay = typeof PRICING_DISPLAY;
