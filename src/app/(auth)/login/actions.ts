"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepositories } from "@/data";
import { ROUTES, SESSION_COOKIE } from "@/lib/constants";

const ONE_WEEK = 60 * 60 * 24 * 7;

/** Inicia sesión como el usuario demo indicado (mock). Establece la cookie de sesión. */
export async function loginAs(userId: string): Promise<void> {
  const user = await getRepositories().users.getById(userId);
  if (!user || !user.isActive) {
    throw new Error("Usuario no válido");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK,
  });
  redirect(ROUTES.home);
}

/** Cierra la sesión y vuelve al login. */
export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect(ROUTES.login);
}
