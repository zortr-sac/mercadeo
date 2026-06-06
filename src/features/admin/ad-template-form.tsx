"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import type { AdTemplate } from "@/data/types";
import {
  createAdTemplateAction,
  removeAdTemplateAction,
  updateAdTemplateAction,
} from "./ad-template-actions";

/** Modal para crear/editar un anuncio de producto (imagen + texto + categoría). */
export function AdTemplateForm({
  businessId,
  template,
  onClose,
}: {
  businessId: string;
  template?: AdTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(template);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(template?.title ?? "");
  const [bodyText, setBodyText] = useState(template?.bodyText ?? "");
  const [category, setCategory] = useState(template?.category ?? "");
  const [imageUrl, setImageUrl] = useState(template?.imageUrl ?? "");
  const [imagePath, setImagePath] = useState(template?.imagePath ?? "");
  const [isPublished, setIsPublished] = useState(template?.isPublished ?? false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) {
      toast.error("Escribe el título del anuncio.");
      return;
    }
    if (bodyText.trim().length < 2 && !imageUrl) {
      toast.error("Agrega el texto del anuncio o una imagen.");
      return;
    }
    const payload = {
      title: title.trim(),
      bodyText: bodyText.trim(),
      category: category.trim() || "General",
      imageUrl: imageUrl || null,
      imagePath: imagePath || null,
      isPublished,
    };
    startTransition(async () => {
      try {
        if (isEdit && template) {
          await updateAdTemplateAction(businessId, template.id, payload);
          toast.success("Anuncio actualizado.");
        } else {
          await createAdTemplateAction(businessId, payload);
          toast.success("Anuncio creado.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar el anuncio.");
      }
    });
  }

  function handleDelete() {
    if (!template) return;
    if (
      !window.confirm(
        `¿Eliminar el anuncio "${template.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeAdTemplateAction(businessId, template.id);
        toast.success("Anuncio eliminado.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar el anuncio.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar anuncio" : "Nuevo anuncio"}
      description="Sube la imagen y el texto. Tus clientes lo verán en la pestaña Vender para copiar y compartir."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" htmlFor="ad-title">
          <Input
            id="ad-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Promo de colágeno"
            required
          />
        </Field>

        <Field
          label="Categoría del producto"
          htmlFor="ad-category"
          hint="Escribe el producto. Los clientes podrán filtrar los anuncios por esta categoría."
        >
          <Input
            id="ad-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Ej. Colágeno"
          />
        </Field>

        <Field
          label="Texto del anuncio"
          htmlFor="ad-body"
          hint="Es el mensaje que el cliente copia y pega o comparte."
        >
          <Textarea
            id="ad-body"
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            rows={5}
            placeholder="Escribe el mensaje listo para compartir…"
          />
        </Field>

        <Field label="Imagen (opcional)" htmlFor="ad-image">
          <FileUpload
            businessId={businessId}
            folder="anuncios"
            accept="image"
            currentUrl={imageUrl || null}
            label="Subir imagen del anuncio"
            onUploaded={({ url, path }) => {
              setImageUrl(url);
              setImagePath(url ? path : "");
            }}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border p-4">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-5 accent-brand-600"
          />
          <span className="text-base">
            Publicado{" "}
            <span className="text-muted-foreground">
              (visible para los clientes del negocio)
            </span>
          </span>
        </label>

        <div className="flex items-center justify-between gap-2 pt-2">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={pending}
              className="text-destructive"
            >
              <Trash2 className="size-5" aria-hidden />
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? "Guardar" : "Crear anuncio"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
