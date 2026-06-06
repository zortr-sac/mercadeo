"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import type { Lesson } from "@/data/types";
import {
  createLessonAction,
  removeLessonAction,
  updateLessonAction,
} from "./academy-actions";

/** Modal para crear o editar una lección en video (subido directo a la nube). */
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
  // Media subida (URL pública de Storage) + duración detectada en el navegador.
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    lesson?.durationMinutes ?? 0,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Escribe un título para la lección.");
      return;
    }
    if (!videoUrl) {
      toast.error("Sube el video de la lección.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && lesson) {
          await updateLessonAction(businessId, lesson.id, {
            title: title.trim(),
            contentType: "video",
            videoUrl,
            content: null,
            resourceUrl: null,
            durationMinutes,
          });
          toast.success("Lección actualizada.");
        } else {
          await createLessonAction(businessId, courseId, {
            title: title.trim(),
            contentType: "video",
            videoUrl,
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
      description="Sube el video de la lección. Se guarda directo en la nube."
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
