import type { MessageTone } from "@/data/types";

/** Etiquetas en español para los tonos de mensaje (no existen en types.ts). */
export const MESSAGE_TONE_LABELS: Record<MessageTone, string> = {
  calm: "Tranquilo",
  warm: "Cercano",
  direct: "Directo",
  reactivation: "Reactivación",
};
