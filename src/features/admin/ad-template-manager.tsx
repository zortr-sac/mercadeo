"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, ImageIcon, Megaphone, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { AdTemplate } from "@/data/types";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { AdTemplateForm } from "./ad-template-form";
import { updateAdTemplateAction } from "./ad-template-actions";

/** Gestión de anuncios del negocio (subir imagen+texto, categoría, publicar, editar). */
export function AdTemplateManager({
  businessId,
  templates,
  counts,
}: {
  businessId: string;
  templates: AdTemplate[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdTemplate | null>(null);
  const [pending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function togglePublish(t: AdTemplate) {
    setTogglingId(t.id);
    startTransition(async () => {
      try {
        await updateAdTemplateAction(businessId, t.id, { isPublished: !t.isPublished });
        toast.success(t.isPublished ? "Anuncio oculto." : "Anuncio publicado.");
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
        icon={Megaphone}
        title="Anuncios"
        description="Sube anuncios (imagen + texto) para que tus clientes los copien y compartan desde la pestaña Vender. El corazón indica cuántos clientes marcaron cada anuncio como favorito."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" aria-hidden />
            Nuevo anuncio
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin anuncios todavía"
          description="Sube tu primer anuncio para que tus clientes lo compartan en sus redes."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Subir anuncio
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <ManagerRow key={t.id}>
              {t.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.imageUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-[var(--radius-md)] object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-muted text-muted-foreground">
                  <ImageIcon className="size-6" aria-hidden />
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
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="truncate">{t.category || "General"}</span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-4 text-rose-500" aria-hidden />
                    {counts[t.id] ?? 0}
                  </span>
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
        <AdTemplateForm businessId={businessId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <AdTemplateForm
          businessId={businessId}
          template={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </ManagerCard>
  );
}
