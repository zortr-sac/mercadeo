"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  MessageSquareText,
  NotebookPen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import {
  INTERACTION_ROLE_LABELS,
  type InteractionRole,
  type Prospect,
  type ProspectInteraction,
} from "@/data/types";
import { longDate } from "@/lib/format";
import {
  addProspectNoteAction,
  deleteInteractionAction,
} from "./conversation-actions";

/** Etiqueta de hora ("14:30") para acompañar la fecha larga sin saturar. */
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Estilos por rol para diferenciar la línea de tiempo tipo chat. */
const ROLE_STYLES: Record<
  InteractionRole,
  { align: "start" | "end" | "center"; bubble: string; label: string }
> = {
  prospect: {
    align: "start",
    bubble: "bg-secondary text-foreground",
    label: "text-muted-foreground",
  },
  seller: {
    align: "end",
    bubble: "bg-brand-600 text-white dark:bg-brand-700",
    label: "text-muted-foreground",
  },
  ai: {
    align: "center",
    bubble:
      "bg-brand-50 text-brand-900 border border-brand-200 dark:bg-brand-900/20 dark:text-brand-100 dark:border-brand-900/50",
    label: "text-brand-700 dark:text-brand-300",
  },
  note: {
    align: "center",
    bubble:
      "bg-gold-50 text-gold-900 border border-gold-200 dark:bg-gold-900/20 dark:text-gold-100 dark:border-gold-900/50",
    label: "text-gold-700 dark:text-gold-300",
  },
};

function TimelineEntry({
  interaction,
  onDelete,
  deleting,
}: {
  interaction: ProspectInteraction;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const style = ROLE_STYLES[interaction.role];
  const alignClass =
    style.align === "end"
      ? "items-end text-right"
      : style.align === "center"
        ? "items-center text-center"
        : "items-start text-left";

  return (
    <li className={`flex flex-col gap-1 ${alignClass}`}>
      <span className={`px-1 text-sm font-semibold ${style.label}`}>
        {INTERACTION_ROLE_LABELS[interaction.role]}
      </span>
      <div
        className={`max-w-[88%] rounded-[var(--radius-lg)] px-4 py-3 text-lg leading-relaxed shadow-sm ${style.bubble}`}
      >
        {interaction.content}
      </div>
      <div className="flex items-center gap-2 px-1">
        <time
          dateTime={interaction.createdAt}
          className="text-sm text-muted-foreground"
        >
          {longDate(interaction.createdAt)} · {timeLabel(interaction.createdAt)}
        </time>
        <button
          type="button"
          onClick={() => onDelete(interaction.id)}
          disabled={deleting}
          aria-label="Eliminar esta entrada de la memoria"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

/**
 * Bloque B: "Memoria de [Nombre]". Reúne lo que la IA y el vendedor saben del
 * cliente: ficha IA, historial tipo chat y un campo para apuntar notas.
 */
export function ProspectMemory({
  prospect,
  interactions,
}: {
  prospect: Prospect;
  interactions: ProspectInteraction[];
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, startSaving] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const firstName = prospect.name.split(" ")[0] || prospect.name;

  function handleSaveNote() {
    const value = note.trim();
    if (value.length < 2) {
      toast.error("Escribe una nota un poco más larga.");
      noteRef.current?.focus();
      return;
    }
    startSaving(async () => {
      try {
        await addProspectNoteAction(prospect.id, value);
        setNote("");
        toast.success("Nota guardada en la memoria.");
        router.refresh();
      } catch {
        toast.error("No se pudo guardar la nota. Inténtalo de nuevo.");
      }
    });
  }

  function handleDelete(interactionId: string) {
    setDeletingId(interactionId);
    deleteInteractionAction(prospect.id, interactionId)
      .then(() => {
        toast.success("Entrada eliminada.");
        router.refresh();
      })
      .catch(() => toast.error("No se pudo eliminar la entrada."))
      .finally(() => setDeletingId(null));
  }

  return (
    <section
      aria-labelledby="memoria-titulo"
      className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <BookOpenCheck className="size-6" aria-hidden />
        </span>
        <div>
          <h2
            id="memoria-titulo"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Memoria de {firstName}
          </h2>
          <p className="text-base text-muted-foreground">
            Lo que tú y la IA saben de este cliente.
          </p>
        </div>
      </div>

      {/* Ficha IA */}
      {prospect.aiProfile ? (
        <div className="rounded-[var(--radius-md)] border border-brand-200 bg-brand-50 p-4 text-brand-900 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-100">
          <p className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-5" aria-hidden />
            Lo que sabemos de {firstName}
          </p>
          <p className="mt-2 text-lg leading-relaxed">{prospect.aiProfile}</p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-muted/40 p-4 text-base leading-relaxed text-muted-foreground">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="size-5" aria-hidden />
            Aún no hay una ficha de {firstName}
          </p>
          <p className="mt-1">
            Cuando uses el asistente de arriba, la IA irá armando aquí un resumen
            de lo que sabe de este cliente.
          </p>
        </div>
      )}

      {/* Historial / línea de tiempo */}
      <div>
        <h3 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <MessageSquareText className="size-5 text-muted-foreground" aria-hidden />
          Historial
        </h3>
        {interactions.length > 0 ? (
          <ul className="mt-4 space-y-5">
            {interactions.map((interaction) => (
              <TimelineEntry
                key={interaction.id}
                interaction={interaction}
                onDelete={handleDelete}
                deleting={deletingId === interaction.id}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-[var(--radius-md)] border border-dashed border-border px-4 py-8 text-center text-base text-muted-foreground">
            Todavía no hay conversaciones registradas con {firstName}.
          </p>
        )}
      </div>

      {/* Agregar nota manual */}
      <div className="space-y-2 border-t border-border pt-5">
        <Label htmlFor="prospect-note" className="text-base">
          Apunta algo sobre este cliente
        </Label>
        <Textarea
          ref={noteRef}
          id="prospect-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="min-h-28 text-lg leading-relaxed"
          placeholder="Ej. Prefiere que la llame por la tarde. Le interesa el producto para dormir mejor."
        />
        <Button
          type="button"
          size="lg"
          onClick={handleSaveNote}
          loading={saving}
          className="h-14 w-full cursor-pointer text-lg sm:w-auto"
        >
          <NotebookPen className="size-5" aria-hidden />
          Guardar nota
        </Button>
      </div>
    </section>
  );
}
