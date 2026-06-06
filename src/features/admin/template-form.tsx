"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import type { MessageTemplate } from "@/data/types";
import {
  createTemplateAction,
  removeTemplateAction,
  updateTemplateAction,
} from "./template-actions";

/** Modal para crear o editar un mensaje del negocio (con system prompt para la IA). */
export function TemplateForm({
  businessId,
  template,
  onClose,
}: {
  businessId: string;
  template?: MessageTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(template);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(template?.title ?? "");
  // `situation` se reutiliza como la descripción breve que ve el miembro.
  const [situation, setSituation] = useState(template?.situation ?? "");
  const [systemPrompt, setSystemPrompt] = useState(template?.systemPrompt ?? "");
  const [baseText, setBaseText] = useState(template?.baseText ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Escribe un nombre para el mensaje.");
      return;
    }
    if (systemPrompt.trim().length < 10) {
      toast.error("Escribe las instrucciones para la IA (system prompt).");
      return;
    }
    const input = {
      title: title.trim(),
      situation: situation.trim(),
      systemPrompt: systemPrompt.trim(),
      baseText: baseText.trim(),
    };
    startTransition(async () => {
      try {
        if (isEdit && template) {
          await updateTemplateAction(businessId, template.id, input);
          toast.success("Mensaje actualizado.");
        } else {
          await createTemplateAction(businessId, input);
          toast.success("Mensaje creado.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar el mensaje.");
      }
    });
  }

  function handleDelete() {
    if (!template) return;
    if (
      !window.confirm(
        `¿Eliminar el mensaje "${template.title}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeTemplateAction(businessId, template.id);
        toast.success("Mensaje eliminado.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar el mensaje.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar mensaje" : "Nuevo mensaje"}
      description="Define cómo debe responder la IA para este mensaje."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre del mensaje" htmlFor="t-title">
          <Input
            id="t-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Saludar a alguien nuevo"
            required
          />
        </Field>
        <Field
          label="Descripción breve"
          htmlFor="t-desc"
          hint="Una línea para que tu equipo sepa de qué se trata."
        >
          <Input
            id="t-desc"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            placeholder="Ej. Para romper el hielo con alguien que acabas de conocer"
          />
        </Field>
        <Field
          label="¿Cómo debe responder la IA? (system prompt)"
          htmlFor="t-system"
          hint="Indícale el objetivo, el tono y el estilo del mensaje que debe redactar."
        >
          <Textarea
            id="t-system"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            rows={6}
            className="min-h-36 text-lg leading-relaxed"
            placeholder="Ej. Eres cálido y cercano. Redacta un saludo breve para romper el hielo con un prospecto nuevo, sin presión, para WhatsApp."
          />
        </Field>
        <Field
          label="Mensaje de ejemplo (respaldo)"
          htmlFor="t-base"
          hint="Se usa tal cual si la IA no está disponible en ese momento."
        >
          <Textarea
            id="t-base"
            value={baseText}
            onChange={(event) => setBaseText(event.target.value)}
            rows={4}
            className="min-h-28 text-lg leading-relaxed"
            placeholder="Ej. Hola, qué gusto saludarte. Me acordé de ti y quería preguntarte cómo has estado…"
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
              {isEdit ? "Guardar" : "Crear mensaje"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
