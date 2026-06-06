"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import type { PresentationTemplate } from "@/data/types";
import {
  createPresentationTemplateAction,
  removePresentationTemplateAction,
  updatePresentationTemplateAction,
} from "./presentation-template-actions";

/** Modal para crear/editar una plantilla de presentación (PPT/PDF + portada opcional). */
export function PresentationTemplateForm({
  businessId,
  template,
  onClose,
}: {
  businessId: string;
  template?: PresentationTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(template);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(template?.title ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(template?.coverUrl ?? "");
  const [fileUrl, setFileUrl] = useState(template?.fileUrl ?? "");
  const [filePath, setFilePath] = useState(template?.filePath ?? "");
  const [fileName, setFileName] = useState(template?.fileName ?? "");
  const [fileBytes, setFileBytes] = useState(template?.fileBytes ?? 0);
  const [isPublished, setIsPublished] = useState(template?.isPublished ?? false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) {
      toast.error("Escribe el título de la plantilla.");
      return;
    }
    if (!isEdit && !fileUrl) {
      toast.error("Sube el archivo (PPT, PPTX o PDF).");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      coverUrl: coverUrl || null,
      fileUrl: fileUrl || null,
      filePath: filePath || null,
      fileName: fileName || null,
      fileBytes,
      isPublished,
    };
    startTransition(async () => {
      try {
        if (isEdit && template) {
          await updatePresentationTemplateAction(businessId, template.id, payload);
          toast.success("Plantilla actualizada.");
        } else {
          await createPresentationTemplateAction(businessId, payload);
          toast.success("Plantilla creada.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar la plantilla.");
      }
    });
  }

  function handleDelete() {
    if (!template) return;
    if (
      !window.confirm(
        `¿Eliminar la plantilla "${template.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removePresentationTemplateAction(businessId, template.id);
        toast.success("Plantilla eliminada.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar la plantilla.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar plantilla" : "Nueva plantilla"}
      description="Sube un PPT, PPTX o PDF. Tus clientes lo verán en Crear → Presentaciones."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" htmlFor="pt-title">
          <Input
            id="pt-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Presenta el producto"
            required
          />
        </Field>
        <Field label="Descripción" htmlFor="pt-desc">
          <Textarea
            id="pt-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="¿De qué trata esta plantilla?"
          />
        </Field>

        <Field label="Archivo (PPT, PPTX o PDF)" htmlFor="pt-file">
          <FileUpload
            businessId={businessId}
            folder="presentaciones"
            accept="document"
            currentUrl={fileUrl || null}
            label="Subir presentación"
            onUploaded={({ url, path, bytes, name }) => {
              setFileUrl(url);
              setFilePath(path);
              setFileBytes(url ? bytes : 0);
              setFileName(url ? name : "");
            }}
          />
        </Field>

        <Field label="Portada (opcional)" htmlFor="pt-cover">
          <FileUpload
            businessId={businessId}
            folder="presentaciones"
            accept="image"
            currentUrl={coverUrl || null}
            label="Subir portada (imagen)"
            onUploaded={({ url }) => setCoverUrl(url)}
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
              {isEdit ? "Guardar" : "Crear plantilla"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
