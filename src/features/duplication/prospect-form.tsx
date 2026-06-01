"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { useProspectsStore } from "@/store/prospects-store";

/** Formulario de creación/edición de prospecto. */
export function ProspectForm({
  ownerId,
  prospect,
  onClose,
}: {
  ownerId: string;
  prospect?: Prospect;
  onClose: () => void;
}) {
  const add = useProspectsStore((s) => s.add);
  const update = useProspectsStore((s) => s.update);
  const remove = useProspectsStore((s) => s.remove);
  const isEdit = Boolean(prospect);

  const [name, setName] = useState(prospect?.name ?? "");
  const [phone, setPhone] = useState(prospect?.phone ?? "");
  const [email, setEmail] = useState(prospect?.email ?? "");
  const [stage, setStage] = useState<ProspectStage>(prospect?.stage ?? "new");
  const [interest, setInterest] = useState<ProspectInterest>(
    prospect?.interest ?? "business",
  );
  const [notes, setNotes] = useState(prospect?.notes ?? "");
  const [nextAction, setNextAction] = useState(
    prospect?.nextActionAt ? prospect.nextActionAt.slice(0, 16) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Escribe el nombre del prospecto.");
      return;
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      stage,
      interest,
      notes: notes.trim(),
      nextActionAt: nextAction ? new Date(nextAction).toISOString() : null,
    };
    if (isEdit && prospect) {
      update(prospect.id, payload);
      toast.success("Prospecto actualizado.");
    } else {
      add(ownerId, payload);
      toast.success("Prospecto agregado.");
    }
    onClose();
  }

  function handleDelete() {
    if (prospect) {
      remove(prospect.id);
      toast.success("Prospecto eliminado.");
      onClose();
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar prospecto" : "Nuevo prospecto"}
      description="Registra los datos y la siguiente acción de seguimiento."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre" htmlFor="p-name">
          <Input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="p-phone">
            <Input
              id="p-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
          </Field>
          <Field label="Correo" htmlFor="p-email">
            <Input
              id="p-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Etapa" htmlFor="p-stage">
            <Select
              id="p-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as ProspectStage)}
            >
              {PROSPECT_STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {PROSPECT_STAGE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Interés" htmlFor="p-interest">
            <Select
              id="p-interest"
              value={interest}
              onChange={(e) =>
                setInterest(e.target.value as ProspectInterest)
              }
            >
              {Object.values(PROSPECT_INTERESTS).map((i) => (
                <option key={i} value={i}>
                  {PROSPECT_INTEREST_LABELS[i]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Próxima acción" htmlFor="p-next" hint="Recordatorio de seguimiento (opcional).">
          <Input
            id="p-next"
            type="datetime-local"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
          />
        </Field>

        <Field label="Notas" htmlFor="p-notes">
          <Textarea
            id="p-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </Field>

        <div className="flex items-center justify-between gap-2 pt-2">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
