import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepositories } from "@/data";
import type { Profile } from "@/data/types";
import { ROUTES, SESSION_COOKIE, type Role } from "./constants";
import { hasAtLeast } from "./rbac";

/**
 * Sesión del lado servidor (mock). Lee la cookie de sesión y resuelve el perfil.
 * En fase 2, esto se reemplaza por `supabase.auth.getUser()` con el mismo contrato.
 */
export async function getSession(): Promise<Profile | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  const user = await getRepositories().users.getById(userId);
  return user && user.isActive ? user : null;
}

/** Exige sesión; si no hay, redirige al login. */
export async function requireSession(): Promise<Profile> {
  const user = await getSession();
  if (!user) redirect(ROUTES.login);
  return user;
}

/** Exige al menos cierto rol; si no cumple, redirige al inicio. */
export async function requireRole(min: Role): Promise<Profile> {
  const user = await requireSession();
  if (!hasAtLeast(user.role, min)) redirect(ROUTES.home);
  return user;
}
