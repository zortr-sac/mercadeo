import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Progreso de lecciones del usuario (local-first).
 * Persistido en localStorage; en fase Supabase se sincroniza vía outbox.
 */
interface ProgressState {
  /** Conjunto de IDs de lecciones completadas. */
  completed: Record<string, boolean>;
  toggle: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  countCompleted: (lessonIds: string[]) => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      toggle: (lessonId) =>
        set((s) => {
          const next = { ...s.completed };
          if (next[lessonId]) delete next[lessonId];
          else next[lessonId] = true;
          return { completed: next };
        }),
      isCompleted: (lessonId) => Boolean(get().completed[lessonId]),
      countCompleted: (lessonIds) =>
        lessonIds.filter((id) => get().completed[id]).length,
    }),
    { name: "nexo-progress" },
  ),
);
