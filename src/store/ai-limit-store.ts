"use client";
// Estado global del popup "llegaste a tu límite de IA". Cualquier pantalla que
// reciba un 429 de /api/ai/* llama useAiLimitStore.getState().show().
import { create } from "zustand";

interface AiLimitState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useAiLimitStore = create<AiLimitState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
