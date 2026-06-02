"use client";

import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PROSPECT_INTEREST_LABELS,
  PROSPECT_STAGE_LABELS,
  type Prospect,
  type ProspectInteraction,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { STAGE_DOT } from "./stage-meta";
import { ConversationAssistant } from "./conversation-assistant";
import { ProspectMemory } from "./prospect-memory";

/**
 * Pantalla de detalle del prospecto. Dos bloques claros:
 *  A) el asistente "¿Qué le respondo?" (lo principal, arriba),
 *  B) la memoria del cliente (ficha IA + historial + notas).
 */
export function ProspectDetail({
  prospect,
  interactions,
}: {
  prospect: Prospect;
  interactions: ProspectInteraction[];
}) {
  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.prospectos}
        className="inline-flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Volver a prospectos
      </Link>

      {/* Encabezado del prospecto */}
      <header className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {prospect.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="px-3 py-1 text-sm">
            <span className={`size-2.5 rounded-full ${STAGE_DOT[prospect.stage]}`} />
            {PROSPECT_STAGE_LABELS[prospect.stage]}
          </Badge>
          <Badge variant="default" className="px-3 py-1 text-sm">
            Interés: {PROSPECT_INTEREST_LABELS[prospect.interest]}
          </Badge>
          {prospect.phone && (
            <span className="inline-flex items-center gap-2 text-base text-muted-foreground">
              <Phone className="size-4" aria-hidden />
              {prospect.phone}
            </span>
          )}
        </div>
      </header>

      {/* Bloque A — el asistente (principal) */}
      <ConversationAssistant prospect={prospect} />

      {/* Bloque B — la memoria del cliente */}
      <ProspectMemory prospect={prospect} interactions={interactions} />
    </div>
  );
}
