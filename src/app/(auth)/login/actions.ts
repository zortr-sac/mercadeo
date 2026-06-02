"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

/** Inicia sesión con correo y contraseña reales (Supabase Auth). */
export async function login(email: string, password: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    throw new Error("Correo o contraseña incorrectos.");
  }
  redirect(ROUTES.home);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.login);
}
