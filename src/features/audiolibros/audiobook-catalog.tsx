"use client";

import { Clock, Headphones, Music2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import type { Audiobook } from "@/data/types";
import { formatDuration } from "@/lib/media";
import { AudioPlayer } from "./audio-player";

/** Catálogo de audiolibros del cliente con filtro por categoría. */
export function AudiobookCatalog({ audiobooks }: { audiobooks: Audiobook[] }) {
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(audiobooks.map((book) => book.category).filter(Boolean)),
    );
    return unique;
  }, [audiobooks]);

  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? audiobooks
        : audiobooks.filter((book) => book.category === filter),
    [audiobooks, filter],
  );

  if (audiobooks.length === 0) {
    return (
      <EmptyState
        icon={Headphones}
        title="Aún no hay audiolibros"
        description="Cuando tu negocio publique audios, los verás aquí para escucharlos."
      />
    );
  }

  const options = [
    { value: "all", label: "Todos" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  return (
    <div className="space-y-5">
      {categories.length > 0 && (
        <Segmented options={options} value={filter} onChange={setFilter} />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="Sin audiolibros en esta categoría"
          description="Prueba con otra categoría."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((book) => (
            <Card key={book.id} className="flex flex-col overflow-hidden">
              <div className="flex gap-4 p-4">
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverUrl}
                    alt=""
                    className="size-24 shrink-0 rounded-[var(--radius-md)] object-cover"
                  />
                ) : (
                  <span className="flex size-24 shrink-0 items-center justify-center rounded-[var(--radius-md)] gradient-brand text-white">
                    <Music2 className="size-9" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold leading-snug">
                    {book.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-base text-muted-foreground">
                    <User className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{book.author}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-base text-muted-foreground">
                    <Clock className="size-4 shrink-0" aria-hidden />
                    {formatDuration(book.durationSeconds)}
                  </p>
                </div>
              </div>

              {book.description && (
                <p className="px-4 text-base leading-relaxed text-muted-foreground">
                  {book.description}
                </p>
              )}

              <div className="mt-auto p-4 pt-4">
                {book.audioUrl ? (
                  <AudioPlayer src={book.audioUrl} title={book.title} />
                ) : (
                  <p className="rounded-[var(--radius-md)] bg-muted p-3 text-center text-base text-muted-foreground">
                    El audio aún no está disponible.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
