"use client";

import { Bell, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGE_ORDER,
  type Prospect,
} from "@/data/types";
import { ProspectCard } from "./prospect-card";
import { ProspectForm } from "./prospect-form";
import { STAGE_DOT } from "./stage-meta";

export function ProspectsBoard({
  ownerId,
  businessId,
  initialProspects,
}: {
  ownerId: string;
  businessId: string | null;
  initialProspects: Prospect[];
}) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [creating, setCreating] = useState(false);

  const mine = useMemo(
    () => prospects.filter((prospect) => prospect.ownerId === ownerId),
    [prospects, ownerId],
  );

  const dueToday = mine.filter((prospect) => {
    if (!prospect.nextActionAt) return false;
    const next = new Date(prospect.nextActionAt);
    const now = new Date();
    return next <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  });

  const byStage = useMemo(() => {
    const map = new Map<string, Prospect[]>();
    for (const stage of PROSPECT_STAGE_ORDER) map.set(stage, []);
    for (const prospect of mine) map.get(prospect.stage)?.push(prospect);
    return map;
  }, [mine]);

  function upsert(prospect: Prospect) {
    setProspects((prev) => {
      const exists = prev.some((item) => item.id === prospect.id);
      return exists
        ? prev.map((item) => (item.id === prospect.id ? prospect : item))
        : [prospect, ...prev];
    });
  }

  function removeLocal(id: string) {
    setProspects((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospectos"
        subtitle="Un CRM sencillo: registra personas, siguiente paso y fecha de seguimiento."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" />
            Nuevo prospecto
          </Button>
        }
      />

      {dueToday.length > 0 && (
        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4 text-gold-900">
          <div className="flex items-start gap-3">
            <Bell className="mt-1 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Seguimientos para hoy</p>
              <p className="mt-1">
                Tienes {dueToday.length} conversacion(es) que revisar. Usa Mensajes
                para generar una respuesta breve y segura.
              </p>
            </div>
          </div>
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aun no tienes prospectos"
          description="Agrega tu primer prospecto y registra la proxima accion."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" />
              Agregar prospecto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {PROSPECT_STAGE_ORDER.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <section key={stage} className="min-h-40 rounded-lg bg-muted/50 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`size-3 rounded-full ${STAGE_DOT[stage]}`} />
                  <h3 className="font-semibold">{PROSPECT_STAGE_LABELS[stage]}</h3>
                  <span className="ml-auto text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((prospect) => (
                    <ProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      onEdit={() => setEditing(prospect)}
                      onMoved={upsert}
                    />
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-muted-foreground">
                      Sin registros
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {creating && (
        <ProspectForm
          ownerId={ownerId}
          businessId={businessId}
          onSaved={upsert}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <ProspectForm
          ownerId={ownerId}
          businessId={businessId}
          prospect={editing}
          onSaved={upsert}
          onDeleted={removeLocal}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
