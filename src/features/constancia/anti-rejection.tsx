import type { ActivityEvent, ActivityStats, Learning } from "@/data/types";
import { LearningsHistory } from "./learnings-history";
import { MindsetCards } from "./mindset-cards";
import { RejectionJournal } from "./rejection-journal";
import { StreakPanel } from "./streak-panel";

/**
 * Sección Constancia: módulo anti-rechazo / de constancia emocional (§5.2.2)
 * + gamificación por actividad (§5.2.3).
 *
 * Orden narrativo, de lo motivador a lo reflexivo:
 *  1) Tu constancia — racha, semana, puntos y logros (premia ESFUERZO, no dinero).
 *  2) Diario anti-rechazo — escribe el "no" y la IA lo reencuadra con calma.
 *  3) Tus aprendizajes — historial de cada "no" superado.
 *  4) Ideas para sostener el ánimo — micro-lecciones de mentalidad.
 *
 * Server component por defecto: solo el diario (RejectionJournal) es cliente.
 */
export function AntiRejectionCoach({
  stats,
  recent,
  learnings,
}: {
  stats: ActivityStats;
  recent: ActivityEvent[];
  learnings: Learning[];
}) {
  return (
    <div className="space-y-6">
      <StreakPanel stats={stats} recent={recent} />
      <RejectionJournal />
      <LearningsHistory learnings={learnings} />
      <MindsetCards />
    </div>
  );
}
