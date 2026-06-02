"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  CalendarClock,
  ChevronRight,
  MessageCircle,
  MessagesSquare,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  PROSPECT_INTEREST_LABELS,
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGE_ORDER,
  type Prospect,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { eventDate } from "@/lib/format";
import { moveProspectAction } from "./prospect-actions";

export function ProspectCard({
  prospect,
  onEdit,
  onMoved,
}: {
  prospect: Prospect;
  onEdit: () => void;
  onMoved: (prospect: Prospect) => void;
}) {
  const [pending, startTransition] = useTransition();
  const idx = PROSPECT_STAGE_ORDER.indexOf(prospect.stage);
  const nextStage =
    idx >= 0 && idx < PROSPECT_STAGE_ORDER.length - 2
      ? PROSPECT_STAGE_ORDER[idx + 1]
      : null;

  function handleMove() {
    if (!nextStage) return;
    startTransition(async () => {
      try {
        const updated = await moveProspectAction(prospect.id, nextStage);
        onMoved(updated);
      } catch {
        toast.error("No se pudo mover el prospecto.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <button onClick={onEdit} className="block w-full text-left">
        <p className="font-semibold leading-tight">{prospect.name}</p>
        <Badge variant="muted" className="mt-2">
          {PROSPECT_INTEREST_LABELS[prospect.interest]}
        </Badge>
        {prospect.phone && (
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4" />
            {prospect.phone}
          </p>
        )}
        {prospect.nextActionAt && (
          <p className="mt-2 flex items-center gap-2 text-gold-700">
            <CalendarClock className="size-4" />
            {eventDate(prospect.nextActionAt)}
          </p>
        )}
      </button>

      <div className="mt-3 grid gap-2">
        <Link
          href={`${ROUTES.prospectos}/${prospect.id}`}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessagesSquare className="size-5" aria-hidden />
          ¿Qué le respondo?
        </Link>
        <Link
          href={`${ROUTES.mensajes}?prospect=${encodeURIComponent(prospect.name)}&phone=${encodeURIComponent(prospect.phone ?? "")}`}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2 font-medium text-brand-700 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageCircle className="size-4" aria-hidden />
          Preparar mensaje
        </Link>
        {nextStage && (
          <button
            onClick={handleMove}
            disabled={pending}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2 font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          >
            Mover a {PROSPECT_STAGE_LABELS[nextStage]}
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
