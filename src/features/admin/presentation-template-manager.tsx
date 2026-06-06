"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, FileText, Pencil, Plus, Presentation } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { PresentationTemplate } from "@/data/types";
import { formatBytes } from "@/lib/media";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { PresentationTemplateForm } from "./presentation-template-form";
import { updatePresentationTemplateAction } from "./presentation-template-actions";

/** Gestión de plantillas de presentación del negocio (subir PPT/PDF, publicar, editar). */
export function PresentationTemplateManager({
  businessId,
  templates,
}: {
  businessId: string;
  templates: PresentationTemplate[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PresentationTemplate | null>(null);
  const [pending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function togglePublish(t: PresentationTemplate) {
    setTogglingId(t.id);
    startTransition(async () => {
      try {
        await updatePresentationTemplateAction(businessId, t.id, {
          isPublished: !t.isPublished,
        });
        toast.success(t.isPublished ? "Plantilla oculta." : "Plantilla publicada.");
        router.refresh();
      } catch {
        toast.error("No se pudo cambiar el estado.");
      } finally {
        setTogglingId(null);
      }
    });
  }

  return (
    <ManagerCard>
      <ManagerHeader
        icon={Presentation}
        title="Presentaciones (plantillas)"
        description="Sube PPT o PDF para que tus clientes los descarguen desde Crear → Presentaciones."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" aria-hidden />
            Nueva plantilla
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={Presentation}
          title="Sin plantillas todavía"
          description="Sube tu primera presentación (PPT o PDF) para que tus clientes la usen."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Subir plantilla
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <ManagerRow key={t.id}>
              {t.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.coverUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-[var(--radius-md)] object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-muted text-muted-foreground">
                  <FileText className="size-6" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {t.title}
                  </h3>
                  <Badge variant={t.isPublished ? "success" : "muted"}>
                    {t.isPublished ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {t.fileName || "archivo"}
                  {t.fileBytes ? ` · ${formatBytes(t.fileBytes)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePublish(t)}
                  loading={pending && togglingId === t.id}
                  disabled={pending}
                >
                  {t.isPublished ? (
                    <>
                      <EyeOff className="size-4" aria-hidden />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" aria-hidden />
                      Publicar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(t)}
                  aria-label={`Editar ${t.title}`}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </div>
            </ManagerRow>
          ))}
        </div>
      )}

      {creating && (
        <PresentationTemplateForm businessId={businessId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <PresentationTemplateForm
          businessId={businessId}
          template={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </ManagerCard>
  );
}
