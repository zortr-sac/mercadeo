/**
 * Container de la capa de datos.
 * Selecciona la implementación según NEXT_PUBLIC_DATA_SOURCE (mock | supabase).
 * La UI siempre llama a `getRepositories()`; nunca importa una implementación concreta.
 */
import { DATA_SOURCE } from "@/lib/constants";
import { mockRepositories } from "./mock";
import type { Repositories } from "./repositories";

let cached: Repositories | null = null;

export function getRepositories(): Repositories {
  if (cached) return cached;

  if (DATA_SOURCE === "supabase") {
    // Fase 2: implementación Supabase.
    // Se implementará en ./supabase y se devolverá aquí.
    // De momento, hacemos fallback a mock para no romper el desarrollo.
    cached = mockRepositories;
  } else {
    cached = mockRepositories;
  }

  return cached;
}
