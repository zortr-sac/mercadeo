"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin, requireRole } from "@/lib/session";
import { memberEmail, normalizePhone, pinToPassword } from "@/lib/auth/credentials";

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

export interface AddMemberResult {
  status: "created";
  phone: string;
  pin: string;
}

/**
 * Crea un miembro (cliente) del negocio con teléfono + PIN. Lo da de alta el
 * admin de plataforma o el líder del negocio. El teléfono + PIN son sus
 * credenciales (se mapean a un email/clave sintéticos de Supabase Auth).
 */
export async function addMemberAction(
  businessId: string,
  input: { name: string; phone: string; pin: string },
): Promise<AddMemberResult> {
  await requireBusinessAdmin(businessId);
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const pin = normalizePhone(input.pin);
  if (name.length < 2) throw new Error("Escribe el nombre del miembro.");
  if (phone.length < 6) throw new Error("Escribe un teléfono válido.");
  if (pin.length !== 4) throw new Error("El PIN debe tener 4 números.");

  const business = await getRepositories().businesses.getById(businessId);
  if (!business) throw new Error("Negocio no encontrado.");

  const admin = createAdminClient();
  const email = memberEmail(phone, business.slug);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: pinToPassword(pin),
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error || !data.user) {
    const duplicate = /already|registered|exist/i.test(error?.message ?? "");
    throw new Error(
      duplicate
        ? "Ese teléfono ya tiene una cuenta en este negocio."
        : "No se pudo crear el miembro.",
    );
  }

  // El trigger crea un perfil mínimo (role member); completamos negocio y datos.
  await admin
    .from("profiles")
    .update({
      business_id: businessId,
      role: "member",
      email,
      full_name: name,
      phone,
      is_active: true,
    })
    .eq("id", data.user.id);

  revalidate(businessId);
  return { status: "created", phone, pin };
}

/** Cambia el PIN de un miembro del negocio (admin de plataforma o líder). */
export async function changeMemberPinAction(
  businessId: string,
  userId: string,
  pin: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  const clean = normalizePhone(pin);
  if (clean.length !== 4) throw new Error("El PIN debe tener 4 números.");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: pinToPassword(clean),
  });
  if (error) throw new Error("No se pudo cambiar el PIN.");
  revalidate(businessId);
}
