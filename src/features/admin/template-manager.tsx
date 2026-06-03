"use client";

import { Lock, MessageCircle, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SCRIPT_CATEGORY_LABELS,
  type MessageTemplate,
} from "@/data/types";
import { ManagerCard, ManagerHeader, ManagerRow, NoticePanel } from "./admin-ui";
import { MESSAGE_TONE_LABELS } from "./message-meta";
import { TemplateForm } from "./template-form";

function TemplateInfo({ template }: { template: MessageTemplate }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-semibold leading-tight">
          {template.title}
        </h3>
        <Badge variant="outline">
          {SCRIPT_CATEGORY_LABELS[template.category]}
        </Badge>
        <Badge variant="muted">{MESSAGE_TONE_LABELS[template.defaultTone]}</Badge>
      </div>
      {template.situation && (
        <p className="mt-1 text-sm text-muted-foreground">
          {template.situation}
        </p>
      )}
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {template.baseText}
      </p>
    </div>
  );
}

/**
 * Gestión de plantillas de mensaje. Separa las plantillas globales de la
 * plataforma (solo lectura) de las propias del negocio (CRUD completo).
 */
export function TemplateManager({
  businessId,
  templates,
}: {
  businessId: string;
  templates: MessageTemplate[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);

  const { global, own } = useMemo(() => {
    const global = templates.filter((t) => t.businessId === null);
    const own = templates.filter((t) => t.businessId === businessId);
    return { global, own };
  }, [templates, businessId]);

  return (
    <div className="space-y-5">
      <ManagerCard>
        <ManagerHeader
          icon={MessageCircle}
          title="De tu negocio"
          description="Plantillas propias que la IA usará para tu equipo. Puedes crearlas, editarlas y eliminarlas."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Nueva plantilla
            </Button>
          }
        />

        {own.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Sin plantillas propias"
            description="Crea plantillas a la medida de tu negocio, además de las globales."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-5" aria-hidden />
                Crear plantilla
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {own.map((template) => (
              <ManagerRow key={template.id}>
                <TemplateInfo template={template} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(template)}
                  aria-label={`Editar ${template.title}`}
                  className="shrink-0"
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </ManagerRow>
            ))}
          </div>
        )}
      </ManagerCard>

      <ManagerCard>
        <ManagerHeader
          icon={Lock}
          title="Base global"
          description="Plantillas compartidas por la plataforma. Están disponibles para todos los negocios."
        />
        <NoticePanel>
          Estas plantillas son de solo lectura: las mantiene la plataforma y no
          se pueden editar desde aquí.
        </NoticePanel>

        {global.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-6 text-center text-base text-muted-foreground">
            No hay plantillas globales por ahora.
          </p>
        ) : (
          <div className="space-y-3">
            {global.map((template) => (
              <ManagerRow key={template.id} className="opacity-95">
                <TemplateInfo template={template} />
                <Badge variant="muted" className="shrink-0">
                  <Lock className="size-3" aria-hidden />
                  Solo lectura
                </Badge>
              </ManagerRow>
            ))}
          </div>
        )}
      </ManagerCard>

      {creating && (
        <TemplateForm
          businessId={businessId}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <TemplateForm
          businessId={businessId}
          template={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
