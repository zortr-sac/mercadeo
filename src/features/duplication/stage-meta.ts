import type { ProspectStage } from "@/data/types";

export const STAGE_DOT: Record<ProspectStage, string> = {
  new: "bg-slate-400",
  contacted: "bg-brand-500",
  presented: "bg-cyan-600",
  followup: "bg-gold-500",
  customer: "bg-green-600",
  lost: "bg-rose-500",
};
