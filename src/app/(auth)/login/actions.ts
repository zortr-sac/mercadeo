"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { clearSessionCookies, startSingleSession } from "@/lib/auth/session-control";

/** Inicia sesión con correo y contraseña reales (Supabase Auth). */
export async function login(email: string, password: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.user) {
    throw new Error("Correo o contraseña incorrectos.");
  }
  await startSingleSession(data.user.id);
  redirect(ROUTES.home);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSessionCookies();
  redirect(ROUTES.login);
}
