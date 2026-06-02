import { BookHeart, RotateCcw, Sprout } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Learning } from "@/data/types";
import { longDate } from "@/lib/format";

/**
 * Bloque 3 — Historial de aprendizajes.
 * Cada "no" reencuadrado queda registrado como prueba de constancia. Lista ya
 * ordenada (desc) desde el servidor. Estado vacío amable si aún no hay ninguno.
 */
export function LearningsHistory({ learnings }: { learnings: Learning[] }) {
  return (
    <section
      aria-labelledby="historial-titulo"
      className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <BookHeart className="size-6" aria-hidden />
        </span>
        <div>
          <h2
            id="historial-titulo"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Tus aprendizajes
          </h2>
          <p className="mt-1 text-base leading-relaxed text-muted-foreground">
            Cada “no” que registras es una muestra de que seguiste adelante.
          </p>
        </div>
      </div>

      {learnings.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Aún no has registrado aprendizajes"
          description="Cuando reencuadres un “no” en el diario y lo guardes, aparecerá aquí. Empieza cuando quieras, sin prisa."
        />
      ) : (
        <ol className="space-y-4">
          {learnings.map((learning) => (
            <li
              key={learning.id}
              className="rounded-[var(--radius-lg)] border border-border bg-secondary/50 p-5"
            >
              <p className="text-base font-semibold text-muted-foreground">
                {longDate(learning.createdAt)}
              </p>
              <p className="mt-2 text-lg leading-relaxed text-foreground">
                {learning.situation}
              </p>
              {learning.reframe && (
                <div className="mt-3 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-brand-200 bg-brand-50 p-4 text-brand-950 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-50">
                  <RotateCcw
                    className="mt-0.5 size-5 shrink-0 text-brand-700 dark:text-brand-300"
                    aria-hidden
                  />
                  <p className="text-base leading-relaxed">{learning.reframe}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
