import type { ComplianceResult } from "@/data/types";

/** Respuesta de POST /api/ai/reframe (contrato fijo del backend). */
export interface ReframeResponse {
  id: string;
  reframe: string;
  suggestedMessage: string;
  source: "gemini" | "fallback";
  compliance: Pick<ComplianceResult, "status">;
  disclaimer: string;
}
