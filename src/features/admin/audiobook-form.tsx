"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Modal } from "@/components/ui/modal";
import type { Audiobook } from "@/data/types";
import {
  createAudiobookAction,
  removeAudiobookAction,
  updateAudiobookAction,
} from "./audiobook-actions";

/** Modal para crear o editar un audiolibro (portada + audio subidos a la nube). */
export function AudiobookForm({
  businessId,
  audiobook,
  onClose,
}: {
  businessId: string;
  audiobook?: Audiobook;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(audiobook);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(audiobook?.title ?? "");
  const [author, setAuthor] = useState(audiobook?.author ?? "");
  const [description, setDescription] = useState(audiobook?.description ?? "");
  const [category, setCategory] = useState(audiobook?.category ?? "General");
  const [coverUrl, setCoverUrl] = useState(audiobook?.coverUrl ?? "");
  const [audioUrl, setAudioUrl] = useState(audiobook?.audioUrl ?? "");
  const [audioPath, setAudioPath] = useState(audiobook?.audioPath ?? "");
  const [durationSeconds, setDurationSeconds] = useState(
    audiobook?.durationSeconds ?? 0,
  );
  const [isPublished, setIsPublished] = useState(
    audiobook?.isPublished ?? false,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 2) {
      toast.error("Escribe el título del audiolibro.");
      return;
    }
    if (author.trim().length < 2) {
      toast.error("Escribe el autor o narrador.");
      return;
    }
    if (!isEdit && !audioUrl) {
      toast.error("Sube el archivo de audio.");
      return;
    }
    startTransition(async () => {
      try {
        if (isEdit && audiobook) {
          await updateAudiobookAction(businessId, audiobook.id, {
            title: title.trim(),
            author: author.trim(),
            description: description.trim(),
            category: category.trim() || "General",
            coverUrl: coverUrl || null,
            audioUrl: audioUrl || null,
            audioPath: audioPath || null,
            durationSeconds,
            isPublished,
          });
          toast.success("Audiolibro actualizado.");
        } else {
          await createAudiobookAction(businessId, {
            title: title.trim(),
            author: author.trim(),
            description: description.trim(),
            category: category.trim() || "General",
            coverUrl: coverUrl || null,
            audioUrl: audioUrl || null,
            audioPath: audioPath || null,
            durationSeconds,
            isPublished,
          });
          toast.success("Audiolibro creado.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar el audiolibro.");
      }
    });
  }

  function handleDelete() {
    if (!audiobook) return;
    if (
      !window.confirm(
        `¿Eliminar el audiolibro "${audiobook.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeAudiobookAction(businessId, audiobook.id);
        toast.success("Audiolibro eliminado.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar el audiolibro.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar audiolibro" : "Nuevo audiolibro"}
      description="Sube el audio y, si quieres, una portada. Se guardan directo en la nube."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" htmlFor="a-title">
          <Input
            id="a-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Hábitos para crecer"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Autor o narrador" htmlFor="a-author">
            <Input
              id="a-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Ej. María Gómez"
              required
            />
          </Field>
          <Field label="Categoría" htmlFor="a-category">
            <Input
              id="a-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ej. Motivación"
            />
          </Field>
        </div>
        <Field label="Descripción" htmlFor="a-desc">
          <Textarea
            id="a-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="¿De qué trata este audiolibro?"
          />
        </Field>

        <Field label="Portada (opcional)" htmlFor="a-cover">
          <FileUpload
            businessId={businessId}
            folder="audiolibros"
            accept="image"
            currentUrl={coverUrl || null}
            label="Subir portada (imagen)"
            onUploaded={({ url }) => setCoverUrl(url)}
          />
        </Field>

        <Field label="Archivo de audio" htmlFor="a-audio">
          <FileUpload
            businessId={businessId}
            folder="audiolibros"
            accept="audio"
            currentUrl={audioUrl || null}
            label="Subir audio (mp3, m4a o wav)"
            onUploaded={({ url, path, durationSeconds: secs }) => {
              setAudioUrl(url);
              setAudioPath(path);
              setDurationSeconds(url ? secs : 0);
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
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? "Guardar" : "Crear audiolibro"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
