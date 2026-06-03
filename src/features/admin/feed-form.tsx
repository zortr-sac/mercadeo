"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  POST_TYPE_LABELS,
  POST_TYPES,
  type Post,
  type PostType,
} from "@/data/types";
import {
  createBusinessPostAction,
  removeBusinessPostAction,
  updateBusinessPostAction,
} from "./feed-admin-actions";

/** Modal para crear o editar una publicación del feed del negocio. */
export function FeedForm({
  businessId,
  post,
  onClose,
}: {
  businessId: string;
  post?: Post;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const [pending, startTransition] = useTransition();

  const [type, setType] = useState<PostType>(post?.type ?? "announcement");
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [eventDate, setEventDate] = useState(
    post?.eventDate ? post.eventDate.slice(0, 16) : "",
  );
  const [eventLocation, setEventLocation] = useState(post?.eventLocation ?? "");
  const [pinned, setPinned] = useState(post?.pinned ?? false);

  const isEvent = type === "event";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Escribe un título para la publicación.");
      return;
    }
    if (body.trim().length < 3) {
      toast.error("Escribe el contenido de la publicación.");
      return;
    }
    const payload = {
      type,
      title: title.trim(),
      body: body.trim(),
      eventDate: isEvent && eventDate ? new Date(eventDate).toISOString() : null,
      eventLocation: isEvent ? eventLocation.trim() || null : null,
      pinned,
    };
    startTransition(async () => {
      try {
        if (isEdit && post) {
          await updateBusinessPostAction(businessId, post.id, payload);
          toast.success("Publicación actualizada.");
        } else {
          await createBusinessPostAction(businessId, payload);
          toast.success("Publicación creada.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar la publicación.");
      }
    });
  }

  function handleDelete() {
    if (!post) return;
    if (
      !window.confirm(
        `¿Eliminar la publicación "${post.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeBusinessPostAction(businessId, post.id);
        toast.success("Publicación eliminada.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar la publicación.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar publicación" : "Nueva publicación"}
      description="Comparte anuncios, motivación, eventos o reconocimientos con tu equipo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tipo de publicación" htmlFor="f-type">
          <Select
            id="f-type"
            value={type}
            onChange={(event) => setType(event.target.value as PostType)}
          >
            {Object.values(POST_TYPES).map((value) => (
              <option key={value} value={value}>
                {POST_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Título" htmlFor="f-title">
          <Input
            id="f-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Reunión de equipo este sábado"
            required
          />
        </Field>
        <Field label="Contenido" htmlFor="f-body">
          <Textarea
            id="f-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            className="min-h-32 text-lg leading-relaxed"
            placeholder="Escribe el mensaje…"
          />
        </Field>

        {isEvent && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha y hora" htmlFor="f-date">
              <Input
                id="f-date"
                type="datetime-local"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
            </Field>
            <Field label="Lugar" htmlFor="f-location">
              <Input
                id="f-location"
                value={eventLocation}
                onChange={(event) => setEventLocation(event.target.value)}
                placeholder="Ej. Local central o enlace"
              />
            </Field>
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border p-4">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(event) => setPinned(event.target.checked)}
            className="size-5 accent-brand-600"
          />
          <span className="text-base">
            Fijar arriba{" "}
            <span className="text-muted-foreground">
              (aparece primero en el feed)
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
              {isEdit ? "Guardar" : "Publicar"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
