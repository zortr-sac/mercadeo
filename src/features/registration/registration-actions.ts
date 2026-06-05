"use server";

import { z } from "zod";
import { getRepositories } from "@/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/constants";

/**
 * Alta pública de un cliente (member) en un negocio a partir de su link de
 * registro. Crea la cuenta real en Supabase Auth con contraseña y la deja
 * activa de inmediato (email_confirm), igual que `inviteLeaderAction` para
 * líderes. El rol y el negocio se derivan en el servidor: el cliente NUNCA
 * puede elegir rol ni negocio arbitrario.
 */
const registerSchema = z.object({
  businessSlug: z.string().min(1),
  name: z.string().trim().min(2, "Escribe tu nombre completo."),
  email: z.string().trim().toLowerCase().email("Escribe un correo válido."),
  phone: z.string().trim().max(30).optional().default(""),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
  acceptedTerms: z.literal(true, {
    message: "Acepta los términos para continuar.",
  }),
});

export type RegisterMemberInput = z.input<typeof registerSchema>;
export type RegisterMemberResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

export async function registerMemberAction(
  raw: RegisterMemberInput,
): Promise<RegisterMemberResult> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }
  const { businessSlug, name, email, phone, password } = parsed.data;

  const business = await getRepositories().businesses.getBySlug(businessSlug);
  if (!business) {
    return { ok: false, error: "El link de registro no es válido." };
  }

  const admin = createAdminClient();

  // El service role bypassa RLS, así detectamos un correo ya registrado.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "Este correo ya tiene una cuenta. Inicia sesión.",
    };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error || !data.user) {
    const duplicate = /already|registered|exist/i.test(error?.message ?? "");
    return {
      ok: false,
      error: duplicate
        ? "Este correo ya tiene una cuenta. Inicia sesión."
        : "No se pudo crear la cuenta. Inténtalo de nuevo.",
    };
  }

  // El trigger `handle_new_user` ya creó un perfil mínimo (role member).
  // Completamos negocio, datos y aseguramos el rol member.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      business_id: business.id,
      role: ROLES.MEMBER,
      email,
      full_name: name,
      phone: phone || null,
      is_active: true,
    })
    .eq("id", data.user.id);

  if (profileError) {
    // Evita dejar una cuenta huérfana sin negocio si el perfil falla.
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, error: "No se pudo completar el registro." };
  }

  return { ok: true, email };
}
