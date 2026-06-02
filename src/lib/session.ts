import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepositories } from "@/data";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/data/types";
import { DATA_SOURCE, ROUTES, SESSION_COOKIE, type Role } from "./constants";
import { hasAtLeast } from "./rbac";

/**
 * Sesión del lado servidor. En modo Supabase resuelve el usuario vía
 * `supabase.auth.getUser()` y carga su perfil; en modo mock lee la cookie demo.
 */
export async function getSession(): Promise<Profile | null> {
  if (DATA_SOURCE === "supabase") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const profile = await getRepositories().users.getById(user.id);
    return profile && profile.isActive ? profile : null;
  }

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
