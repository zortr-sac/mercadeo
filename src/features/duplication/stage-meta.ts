import type { ProspectStage } from "@/data/types";

/** Color del indicador por etapa del pipeline. */
export const STAGE_DOT: Record<ProspectStage, string> = {
  new: "bg-slate-400",
  contacted: "bg-brand-500",
  presented: "bg-violet-500",
  followup: "bg-gold-500",
  closed: "bg-green-500",
  lost: "bg-rose-500",
};
