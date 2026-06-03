"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import {
  LESSON_TYPE_LABELS,
  type Lesson,
  type LessonType,
} from "@/data/types";
import {
  createLessonAction,
  removeLessonAction,
  updateLessonAction,
} from "./academy-actions";

// Solo ofrecemos los tipos con flujo de creación claro para 50+.
const LESSON_TYPE_OPTIONS: LessonType[] = ["video", "article", "pdf"];

/** Modal para crear o editar una lección (video subido, texto o PDF). */
export function LessonForm({
  businessId,
  courseId,
  lesson,
  onClose,
}: {
  businessId: string;
  courseId: string;
  lesson?: Lesson;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(lesson);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [contentType, setContentType] = useState<LessonType>(
    lesson?.contentType ?? "video",
  );
  const [content, setContent] = useState(lesson?.content ?? "");
  // Media subida (URL pública de Storage) + duración detectada en el navegador.
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [resourceUrl, setResourceUrl] = useState(lesson?.resourceUrl ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    lesson?.durationMinutes ?? 0,
  );

  function validate(): boolean {
    if (title.trim().length < 3) {
      toast.error("Escribe un título para la lección.");
      return false;
    }
    if (contentType === "video" && !videoUrl) {
      toast.error("Sube el video de la lección.");
      return false;
    }
    if (contentType === "article" && content.trim().length < 5) {
      toast.error("Escribe el texto de la lección.");
      return false;
    }
    if (contentType === "pdf" && !resourceUrl) {
      toast.error("Sube el PDF de la lección.");
      return false;
    }
    return true;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        if (isEdit && lesson) {
          await updateLessonAction(businessId, lesson.id, {
            title: title.trim(),
            contentType,
            videoUrl: contentType === "video" ? videoUrl : null,
            content: contentType === "article" ? content.trim() : null,
            resourceUrl: contentType === "pdf" ? resourceUrl : null,
            durationMinutes,
          });
          toast.success("Lección actualizada.");
        } else {
          await createLessonAction(businessId, courseId, {
            title: title.trim(),
            contentType,
            videoUrl: contentType === "video" ? videoUrl : null,
            content: contentType === "article" ? content.trim() : null,
            durationMinutes,
          });
          toast.success("Lección creada.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar la lección.");
      }
    });
  }

  function handleDelete() {
    if (!lesson) return;
    if (
      !window.confirm(
        `¿Eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeLessonAction(businessId, lesson.id);
        toast.success("Lección eliminada.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar la lección.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar lección" : "Nueva lección"}
      description="Elige el tipo de contenido y súbelo. El video se guarda directo en la nube."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título de la lección" htmlFor="l-title">
          <Input
            id="l-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Cómo presentar el producto"
            required
          />
        </Field>

        <Field label="Tipo de contenido" htmlFor="l-type">
          <Select
            id="l-type"
            value={contentType}
            onChange={(event) =>
              setContentType(event.target.value as LessonType)
            }
          >
            {LESSON_TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {LESSON_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        {contentType === "video" && (
          <Field label="Video de la lección" htmlFor="l-video">
            <FileUpload
              businessId={businessId}
              folder="academia"
              accept="video"
              currentUrl={videoUrl || null}
              label="Subir video (mp4, webm o mov)"
              onUploaded={({ url, durationSeconds }) => {
                setVideoUrl(url);
                if (url) {
                  setDurationMinutes(Math.max(1, Math.round(durationSeconds / 60)));
                } else {
                  setDurationMinutes(0);
                }
              }}
            />
          </Field>
        )}

        {contentType === "article" && (
          <Field
            label="Texto de la lección"
            htmlFor="l-content"
            hint="Puedes usar formato Markdown (títulos, listas, negritas)."
          >
            <Textarea
              id="l-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              className="min-h-40 text-lg leading-relaxed"
              placeholder="Escribe el contenido de la lección…"
            />
          </Field>
        )}

        {contentType === "pdf" && (
          <Field
            label="Enlace al PDF"
            htmlFor="l-pdf"
            hint="Pega el enlace público del documento (por ejemplo, de Google Drive o tu nube)."
          >
            <Input
              id="l-pdf"
              type="url"
              value={resourceUrl}
              onChange={(event) => setResourceUrl(event.target.value)}
              placeholder="https://…"
            />
          </Field>
        )}

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
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? "Guardar" : "Crear lección"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
