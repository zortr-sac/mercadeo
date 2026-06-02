/**
 * Container de la capa de datos.
 * Selecciona la implementación según NEXT_PUBLIC_DATA_SOURCE (mock | supabase).
 * La UI siempre llama a `getRepositories()`; nunca importa una implementación concreta.
 */
import { DATA_SOURCE } from "@/lib/constants";
import { mockRepositories } from "./mock";
import { supabaseRepositories } from "./supabase";
import type { Repositories } from "./repositories";

let cached: Repositories | null = null;

export function getRepositories(): Repositories {
  if (cached) return cached;
  cached = DATA_SOURCE === "supabase" ? supabaseRepositories : mockRepositories;
  return cached;
}
