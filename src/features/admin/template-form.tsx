"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  SCRIPT_CATEGORY_LABELS,
  type MessageTemplate,
  type MessageTone,
  type ScriptCategory,
} from "@/data/types";
import { MESSAGE_TONE_LABELS } from "./message-meta";
import {
  createTemplateAction,
  removeTemplateAction,
  updateTemplateAction,
} from "./template-actions";

/** Modal para crear o editar una plantilla de mensaje del negocio. */
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
  const [category, setCategory] = useState<ScriptCategory>(
    template?.category ?? "prospecting",
  );
  const [situation, setSituation] = useState(template?.situation ?? "");
  const [baseText, setBaseText] = useState(template?.baseText ?? "");
  const [defaultTone, setDefaultTone] = useState<MessageTone>(
    template?.defaultTone ?? "warm",
  );
  const [complianceHint, setComplianceHint] = useState(
    template?.complianceHint ?? "",
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Escribe un título para la plantilla.");
      return;
    }
    if (baseText.trim().length < 5) {
      toast.error("Escribe el texto base de la plantilla.");
      return;
    }
    const input = {
      title: title.trim(),
      category,
      situation: situation.trim(),
      baseText: baseText.trim(),
      defaultTone,
      complianceHint: complianceHint.trim(),
    };
    startTransition(async () => {
      try {
        if (isEdit && template) {
          await updateTemplateAction(businessId, template.id, input);
          toast.success("Plantilla actualizada.");
        } else {
          await createTemplateAction(businessId, input);
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
        await removeTemplateAction(businessId, template.id);
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
      description="Texto base que la IA personaliza para cada cliente. Evita prometer ingresos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" htmlFor="t-title">
          <Input
            id="t-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Primer saludo a un conocido"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría" htmlFor="t-category">
            <Select
              id="t-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ScriptCategory)
              }
            >
              {Object.entries(SCRIPT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tono" htmlFor="t-tone">
            <Select
              id="t-tone"
              value={defaultTone}
              onChange={(event) =>
                setDefaultTone(event.target.value as MessageTone)
              }
            >
              {Object.entries(MESSAGE_TONE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          label="Situación"
          htmlFor="t-situation"
          hint="¿Cuándo se usa esta plantilla?"
        >
          <Input
            id="t-situation"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            placeholder="Ej. La persona mostró interés pero no respondió"
          />
        </Field>
        <Field label="Texto base" htmlFor="t-base">
          <Textarea
            id="t-base"
            value={baseText}
            onChange={(event) => setBaseText(event.target.value)}
            rows={5}
            className="min-h-32 text-lg leading-relaxed"
            placeholder="Escribe el mensaje base…"
          />
        </Field>
        <Field
          label="Nota de cumplimiento"
          htmlFor="t-hint"
          hint="Recordatorio para usar la plantilla de forma segura (opcional)."
        >
          <Input
            id="t-hint"
            value={complianceHint}
            onChange={(event) => setComplianceHint(event.target.value)}
            placeholder="Ej. No prometer ganancias ni resultados."
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
              {isEdit ? "Guardar" : "Crear plantilla"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
