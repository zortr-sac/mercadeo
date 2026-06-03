"use client";

import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Headphones,
  Music2,
  Pencil,
  Plus,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Audiobook } from "@/data/types";
import { formatDuration } from "@/lib/media";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { AudiobookForm } from "./audiobook-form";
import { updateAudiobookAction } from "./audiobook-actions";

/** Gestión de audiolibros del negocio (crear / editar / publicar / eliminar). */
export function AudiobookManager({
  businessId,
  audiobooks,
}: {
  businessId: string;
  audiobooks: Audiobook[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Audiobook | null>(null);
  const [pending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function togglePublish(book: Audiobook) {
    setTogglingId(book.id);
    startTransition(async () => {
      try {
        await updateAudiobookAction(businessId, book.id, {
          isPublished: !book.isPublished,
        });
        toast.success(book.isPublished ? "Audiolibro oculto." : "Audiolibro publicado.");
        router.refresh();
      } catch {
        toast.error("No se pudo cambiar el estado.");
      } finally {
        setTogglingId(null);
      }
    });
  }

  return (
    <ManagerCard>
      <ManagerHeader
        icon={Headphones}
        title="Audiolibros"
        description="Sube audios para que los clientes los escuchen desde la app."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" aria-hidden />
            Nuevo audiolibro
          </Button>
        }
      />

      {audiobooks.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="Sin audiolibros todavía"
          description="Sube tu primer audio para que el negocio tenga su biblioteca."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Subir audiolibro
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {audiobooks.map((book) => (
            <ManagerRow key={book.id}>
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-[var(--radius-md)] object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-muted text-muted-foreground">
                  <Music2 className="size-6" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {book.title}
                  </h3>
                  <Badge variant={book.isPublished ? "success" : "muted"}>
                    {book.isPublished ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {book.author} · {formatDuration(book.durationSeconds)} ·{" "}
                  {book.category}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePublish(book)}
                  loading={pending && togglingId === book.id}
                  disabled={pending}
                >
                  {book.isPublished ? (
                    <>
                      <EyeOff className="size-4" aria-hidden />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" aria-hidden />
                      Publicar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(book)}
                  aria-label={`Editar ${book.title}`}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </div>
            </ManagerRow>
          ))}
        </div>
      )}

      {creating && (
        <AudiobookForm
          businessId={businessId}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <AudiobookForm
          businessId={businessId}
          audiobook={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </ManagerCard>
  );
}
