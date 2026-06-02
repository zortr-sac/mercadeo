"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  PROSPECT_INTEREST_LABELS,
  PROSPECT_INTERESTS,
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGE_ORDER,
  type Prospect,
  type ProspectInterest,
  type ProspectStage,
} from "@/data/types";
import {
  createProspectAction,
  deleteProspectAction,
  updateProspectAction,
} from "./prospect-actions";

export function ProspectForm({
  prospect,
  onSaved,
  onDeleted,
  onClose,
}: {
  ownerId: string;
  businessId: string | null;
  prospect?: Prospect;
  onSaved: (prospect: Prospect) => void;
  onDeleted?: (id: string) => void;
  onClose: () => void;
}) {
  const isEdit = Boolean(prospect);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(prospect?.name ?? "");
  const [phone, setPhone] = useState(prospect?.phone ?? "");
  const [email, setEmail] = useState(prospect?.email ?? "");
  const [stage, setStage] = useState<ProspectStage>(prospect?.stage ?? "new");
  const [interest, setInterest] = useState<ProspectInterest>(
    prospect?.interest ?? "product",
  );
  const [notes, setNotes] = useState(prospect?.notes ?? "");
  const [nextAction, setNextAction] = useState(
    prospect?.nextActionAt ? prospect.nextActionAt.slice(0, 16) : "",
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Escribe el nombre del prospecto.");
      return;
    }
    const draft = {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      stage,
      interest,
      notes: notes.trim(),
      nextActionAt: nextAction ? new Date(nextAction).toISOString() : null,
    };
    startTransition(async () => {
      try {
        const saved =
          isEdit && prospect
            ? await updateProspectAction(prospect.id, draft)
            : await createProspectAction(draft);
        onSaved(saved);
        toast.success(isEdit ? "Prospecto actualizado." : "Prospecto agregado.");
        onClose();
      } catch {
        toast.error("No se pudo guardar el prospecto.");
      }
    });
  }

  function handleDelete() {
    if (!prospect) return;
    startTransition(async () => {
      try {
        await deleteProspectAction(prospect.id);
        onDeleted?.(prospect.id);
        toast.success("Prospecto eliminado.");
        onClose();
      } catch {
        toast.error("No se pudo eliminar el prospecto.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar prospecto" : "Nuevo prospecto"}
      description="Registra datos basicos y una fecha de seguimiento."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre" htmlFor="p-name">
          <Input
            id="p-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefono / WhatsApp" htmlFor="p-phone">
            <Input
              id="p-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              placeholder="+51 999 999 999"
            />
          </Field>
          <Field label="Correo" htmlFor="p-email">
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Etapa" htmlFor="p-stage">
            <Select
              id="p-stage"
              value={stage}
              onChange={(event) => setStage(event.target.value as ProspectStage)}
            >
              {PROSPECT_STAGE_ORDER.map((item) => (
                <option key={item} value={item}>
                  {PROSPECT_STAGE_LABELS[item]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Interes" htmlFor="p-interest">
            <Select
              id="p-interest"
              value={interest}
              onChange={(event) =>
                setInterest(event.target.value as ProspectInterest)
              }
            >
              {Object.values(PROSPECT_INTERESTS).map((item) => (
                <option key={item} value={item}>
                  {PROSPECT_INTEREST_LABELS[item]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Proxima accion"
          htmlFor="p-next"
          hint="La app lo usara para recordarte."
        >
          <Input
            id="p-next"
            type="datetime-local"
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
          />
        </Field>

        <Field label="Notas" htmlFor="p-notes">
          <Textarea
            id="p-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
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
              <Trash2 className="size-5" />
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
              {isEdit ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
