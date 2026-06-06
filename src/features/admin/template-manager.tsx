"use client";

import { MessageCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { MessageTemplate } from "@/data/types";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { TemplateForm } from "./template-form";

/** Gestión de los mensajes de un negocio: crear, editar y eliminar (con system prompt). */
export function TemplateManager({
  businessId,
  templates,
}: {
  businessId: string;
  templates: MessageTemplate[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);

  return (
    <div className="space-y-5">
      <ManagerCard>
        <ManagerHeader
          icon={MessageCircle}
          title="Mensajes de este negocio"
          description="Crea los mensajes que la IA usará para tu equipo. Tú defines cómo debe responder."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Nuevo mensaje
            </Button>
          }
        />

        {templates.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="Sin mensajes todavía"
            description="Crea el primer mensaje de este negocio para que tu equipo lo use al vender."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-5" aria-hidden />
                Crear mensaje
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <ManagerRow key={template.id}>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {template.title}
                  </h3>
                  {template.situation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.situation}
                    </p>
                  )}
                </div>
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
