"use client";

import { create } from "zustand";
import { listStoredAudiobooks, listStoredCourses } from "@/lib/offline/db";

export type ItemState = "idle" | "downloading" | "done" | "error";

interface OfflineState {
  online: boolean;
  setOnline: (v: boolean) => void;
  downloadedCourses: Set<string>; // slugs
  downloadedAudiobooks: Set<string>; // ids
  status: Record<string, { state: ItemState; done: number; total: number }>;
  setStatus: (key: string, s: { state: ItemState; done: number; total: number }) => void;
  markCourse: (slug: string, downloaded: boolean) => void;
  markAudiobook: (id: string, downloaded: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  // Siempre true en el render inicial (servidor y cliente coinciden); el valor
  // real lo fija OfflineBootstrap tras hidratar, evitando un hydration mismatch.
  online: true,
  setOnline: (online) => set({ online }),
  downloadedCourses: new Set<string>(),
  downloadedAudiobooks: new Set<string>(),
  status: {},
  setStatus: (key, s) => set((st) => ({ status: { ...st.status, [key]: s } })),
  markCourse: (slug, downloaded) =>
    set((st) => {
      const next = new Set(st.downloadedCourses);
      if (downloaded) next.add(slug);
      else next.delete(slug);
      return { downloadedCourses: next };
    }),
  markAudiobook: (id, downloaded) =>
    set((st) => {
      const next = new Set(st.downloadedAudiobooks);
      if (downloaded) next.add(id);
      else next.delete(id);
      return { downloadedAudiobooks: next };
    }),
  hydrate: async () => {
    try {
      const [courses, books] = await Promise.all([
        listStoredCourses(),
        listStoredAudiobooks(),
      ]);
      set({
        downloadedCourses: new Set(courses.map((c) => c.slug)),
        downloadedAudiobooks: new Set(books.map((b) => b.id)),
      });
    } catch {
      // IndexedDB no disponible: la app sigue funcionando online.
    }
  },
}));
