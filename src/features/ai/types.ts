import type { ComplianceResult } from "@/data/types";

export interface MessageResponse {
  id: string;
  message: string;
  source: "gemini" | "fallback";
  compliance: ComplianceResult;
  disclaimer: string;
}
