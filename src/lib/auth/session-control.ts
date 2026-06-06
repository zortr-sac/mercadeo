import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBER_SLUG_COOKIE, SESSION_ID_COOKIE } from "@/lib/constants";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Registra una sesión ÚNICA: guarda un token nuevo en el perfil (service-role)
 * y en una cookie httpOnly. El middleware expulsa cualquier dispositivo cuyo
 * token no coincida con el del perfil → una cuenta = una sola sesión activa.
 */
export async function startSingleSession(
  userId: string,
  memberSlug?: string,
): Promise<void> {
  const sid = crypto.randomUUID();
  const admin = createAdminClient();
  await admin.from("profiles").update({ active_session_id: sid }).eq("id", userId);

  const store = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  };
  store.set(SESSION_ID_COOKIE, sid, opts);
  if (memberSlug) store.set(MEMBER_SLUG_COOKIE, memberSlug, opts);
}

/** Limpia las cookies de sesión única (al cerrar sesión). */
export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_ID_COOKIE);
  store.delete(MEMBER_SLUG_COOKIE);
}
