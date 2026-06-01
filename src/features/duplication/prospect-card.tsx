"use client";

import { CalendarClock, ChevronRight, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PROSPECT_INTEREST_LABELS,
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGE_ORDER,
  type Prospect,
} from "@/data/types";
import { eventDate } from "@/lib/format";
import { useProspectsStore } from "@/store/prospects-store";

/** Tarjeta de prospecto con avance rápido de etapa. */
export function ProspectCard({
  prospect,
  onEdit,
}: {
  prospect: Prospect;
  onEdit: () => void;
}) {
  const move = useProspectsStore((s) => s.move);
  const idx = PROSPECT_STAGE_ORDER.indexOf(prospect.stage);
  const nextStage =
    idx >= 0 && idx < PROSPECT_STAGE_ORDER.length - 2
      ? PROSPECT_STAGE_ORDER[idx + 1]
      : null;

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card p-3 shadow-sm">
      <button onClick={onEdit} className="block w-full text-left">
        <p className="font-medium leading-tight">{prospect.name}</p>
        <Badge variant="muted" className="mt-1.5">
          {PROSPECT_INTEREST_LABELS[prospect.interest]}
        </Badge>
        {prospect.phone && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" />
            {prospect.phone}
          </p>
        )}
        {prospect.nextActionAt && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gold-700 dark:text-gold-400">
            <CalendarClock className="size-3" />
            {eventDate(prospect.nextActionAt)}
          </p>
        )}
      </button>

      {nextStage && (
        <button
          onClick={() => move(prospect.id, nextStage)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-border py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-muted dark:text-brand-400"
        >
          Mover a {PROSPECT_STAGE_LABELS[nextStage]}
          <ChevronRight className="size-3" />
        </button>
      )}
    </div>
  );
}
