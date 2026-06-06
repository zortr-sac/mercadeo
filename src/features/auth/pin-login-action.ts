"use server";

import { redirect } from "next/navigation";
import { getRepositories } from "@/data";
import { createClient } from "@/lib/supabase/server";
import { memberEmail, normalizePhone, pinToPassword } from "@/lib/auth/credentials";
import { startSingleSession } from "@/lib/auth/session-control";
import { ROUTES } from "@/lib/constants";

export type PinLoginResult = { ok: false; error: string };

/**
 * Inicio de sesión de un miembro con teléfono + PIN. Mapea ambos al email/clave
 * sintéticos de Supabase Auth y registra la sesión única. En éxito redirige.
 */
export async function loginWithPinAction(
  slug: string,
  phone: string,
  pin: string,
): Promise<PinLoginResult> {
  const cleanPhone = normalizePhone(phone);
  const cleanPin = normalizePhone(pin);
  if (cleanPhone.length < 6) {
    return { ok: false, error: "Escribe tu número de teléfono." };
  }
  if (cleanPin.length !== 4) {
    return { ok: false, error: "Tu PIN son 4 números." };
  }

  const business = await getRepositories().businesses.getBySlug(slug);
  if (!business) {
    return { ok: false, error: "Este negocio no existe." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: memberEmail(cleanPhone, slug),
    password: pinToPassword(cleanPin),
  });
  if (error || !data.user) {
    return { ok: false, error: "Teléfono o PIN incorrectos. Revísalos e inténtalo otra vez." };
  }

  await startSingleSession(data.user.id, slug);
  redirect(ROUTES.home);
}
