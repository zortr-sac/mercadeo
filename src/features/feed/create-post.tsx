"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { POST_TYPE_LABELS, POST_TYPES } from "@/data/types";
import { createPostAction, type CreatePostState } from "./actions";

const initial: CreatePostState = {};

/** Botón + modal para crear una publicación (líder/admin). */
export function CreatePostButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(POST_TYPES.ANNOUNCEMENT);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createPostAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Publicación creada.");
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" />
        Publicar
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva publicación"
        description="Comparte un anuncio, evento, reconocimiento o motivación."
      >
        <form action={formAction} className="space-y-4">
          <Field label="Tipo" htmlFor="type">
            <Select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.values(POST_TYPES).map((t) => (
                <option key={t} value={t}>
                  {POST_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Título" htmlFor="title">
            <Input id="title" name="title" required maxLength={120} />
          </Field>

          <Field label="Contenido" htmlFor="body">
            <Textarea id="body" name="body" required rows={5} />
          </Field>

          {type === POST_TYPES.EVENT && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha y hora" htmlFor="eventDate">
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                />
              </Field>
              <Field label="Lugar o enlace" htmlFor="eventLocation">
                <Input id="eventLocation" name="eventLocation" />
              </Field>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Publicar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
