"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminBusinessPath } from "@/lib/constants";
import { requireRole } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "lideres"));
}

function tempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const pick = (set: string, n: number) =>
    Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join("");
  return `${pick(upper, 2)}${pick(lower, 4)}${pick(digits, 3)}#`;
}

function nameFromEmail(email: string): string {
  const base = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Líder";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Asigna un usuario existente como líder del negocio. */
export async function assignLeaderAction(
  businessId: string,
  userId: string,
): Promise<void> {
  await requireRole("admin");
  await getRepositories().users.assign(userId, businessId, "leader");
  revalidate(businessId);
}

/** Quita el rol de líder (vuelve a miembro del mismo negocio). */
export async function demoteToMemberAction(
  businessId: string,
  userId: string,
): Promise<void> {
  await requireRole("admin");
  await getRepositories().users.assign(userId, businessId, "member");
  revalidate(businessId);
}

/** Saca a la persona del negocio (sin negocio, rol miembro). */
export async function removeFromBusinessAction(
  businessId: string,
  userId: string,
): Promise<void> {
  await requireRole("admin");
  await getRepositories().users.assign(userId, null, "member");
  revalidate(businessId);
}

export interface InviteLeaderResult {
  status: "assigned" | "created";
  email: string;
  tempPassword?: string;
}

/**
 * Invita a alguien como líder por correo: si ya existe lo asigna; si no,
 * crea la cuenta (service role) con contraseña temporal y la asigna.
 */
export async function inviteLeaderAction(
  businessId: string,
  email: string,
): Promise<InviteLeaderResult> {
  await requireRole("admin");
  const clean = email.trim().toLowerCase();
  const repos = getRepositories();

  const existing = await repos.users.findByEmail(clean);
  if (existing) {
    await repos.users.assign(existing.id, businessId, "leader");
    revalidate(businessId);
    return { status: "assigned", email: clean };
  }

  const admin = createAdminClient();
  const password = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email: clean,
    password,
    email_confirm: true,
    user_metadata: { full_name: nameFromEmail(clean) },
  });
  if (error || !data.user) {
    throw new Error("No se pudo crear la cuenta del líder.");
  }

  // Completa el perfil (el trigger crea uno mínimo). Service role bypassa RLS.
  await admin
    .from("profiles")
    .update({
      business_id: businessId,
      role: "leader",
      email: clean,
      full_name: nameFromEmail(clean),
      is_active: true,
    })
    .eq("id", data.user.id);

  revalidate(businessId);
  return { status: "created", email: clean, tempPassword: password };
}
