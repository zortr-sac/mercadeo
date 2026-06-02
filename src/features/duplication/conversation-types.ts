import type { ComplianceIssue } from "@/data/types";

/** Una de las 3 respuestas sugeridas por la IA (ya pasada por el Modo Cumplimiento). */
export interface ConversationSuggestion {
  text: string;
  status: "safe" | "needs_review" | "blocked";
  issues: ComplianceIssue[];
}

/** Respuesta del endpoint POST /api/ai/conversation. */
export interface ConversationResponse {
  id: string;
  reading: string;
  suggestions: ConversationSuggestion[];
  profile: string | null;
  source: string;
  disclaimer: string;
}
