import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_PROSPECTS } from "@/data/mock/seed-prospects";
import type { Prospect, ProspectStage } from "@/data/types";

/** Entrada para crear/editar un prospecto (sin campos derivados). */
export type ProspectDraft = Omit<Prospect, "id" | "ownerId" | "createdAt">;

interface ProspectsState {
  prospects: Prospect[];
  add: (ownerId: string, draft: ProspectDraft) => void;
  update: (id: string, patch: Partial<Prospect>) => void;
  move: (id: string, stage: ProspectStage) => void;
  remove: (id: string) => void;
}

/**
 * CRM de prospectos local-first (persistido en localStorage).
 * Cada usuario gestiona los suyos; al conectar Supabase se migra con RLS por owner.
 */
export const useProspectsStore = create<ProspectsState>()(
  persist(
    (set) => ({
      prospects: SEED_PROSPECTS,
      add: (ownerId, draft) =>
        set((s) => ({
          prospects: [
            {
              ...draft,
              id: `pr-${s.prospects.length + 1}-${Date.now()}`,
              ownerId,
              createdAt: new Date().toISOString(),
            },
            ...s.prospects,
          ],
        })),
      update: (id, patch) =>
        set((s) => ({
          prospects: s.prospects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      move: (id, stage) =>
        set((s) => ({
          prospects: s.prospects.map((p) =>
            p.id === id ? { ...p, stage } : p,
          ),
        })),
      remove: (id) =>
        set((s) => ({ prospects: s.prospects.filter((p) => p.id !== id) })),
    }),
    { name: "hgw-prospects", version: 1 },
  ),
);
