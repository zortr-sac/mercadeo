"use client";

import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGE_ORDER,
  type Prospect,
} from "@/data/types";
import { useProspectsStore } from "@/store/prospects-store";
import { ProspectCard } from "./prospect-card";
import { ProspectForm } from "./prospect-form";
import { STAGE_DOT } from "./stage-meta";

/** Tablero kanban de prospectos (CRM personal). */
export function ProspectsBoard({ ownerId }: { ownerId: string }) {
  const all = useProspectsStore((s) => s.prospects);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [creating, setCreating] = useState(false);

  const mine = useMemo(
    () => all.filter((p) => p.ownerId === ownerId),
    [all, ownerId],
  );

  const byStage = useMemo(() => {
    const map = new Map<string, Prospect[]>();
    for (const stage of PROSPECT_STAGE_ORDER) map.set(stage, []);
    for (const p of mine) map.get(p.stage)?.push(p);
    return map;
  }, [mine]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospectos"
        subtitle="Tu CRM personal. Sigue cada prospecto hasta el cierre."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nuevo
          </Button>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no tienes prospectos"
          description="Agrega tu primer prospecto y empieza a construir tu lista."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Agregar prospecto
            </Button>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {PROSPECT_STAGE_ORDER.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} className="w-72 shrink-0">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={`size-2.5 rounded-full ${STAGE_DOT[stage]}`} />
                  <h3 className="text-sm font-semibold">
                    {PROSPECT_STAGE_LABELS[stage]}
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 rounded-[var(--radius-lg)] bg-muted/40 p-2">
                  {items.map((p) => (
                    <ProspectCard
                      key={p.id}
                      prospect={p}
                      onEdit={() => setEditing(p)}
                    />
                  ))}
                  {items.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                      Sin prospectos
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <ProspectForm ownerId={ownerId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <ProspectForm
          ownerId={ownerId}
          prospect={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
