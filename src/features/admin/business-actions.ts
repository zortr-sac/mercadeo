"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type {
  NewBusinessContentInput,
  NewBusinessInput,
} from "@/data/repositories";
import type { Business, BusinessContent } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { isValidHex } from "@/lib/brand-theme";
import { requireBusinessAdmin, requireRole } from "@/lib/session";

/** Crea un negocio (solo admin de plataforma). */
export async function createBusinessAction(
  input: NewBusinessInput,
): Promise<Business> {
  await requireRole("admin");
  const business = await getRepositories().businesses.create(input);
  revalidatePath(ROUTES.admin);
  return business;
}

/** Conecta o limpia el dominio principal de un negocio. */
export async function updateBusinessDomainAction(
  id: string,
  hostname: string | null,
): Promise<void> {
  await requireRole("leader");
  await getRepositories().businesses.updateDomain(id, hostname);
  revalidatePath(ROUTES.admin);
}

/** Actualiza el color de marca del negocio (unicolor). Admin o líder del negocio. */
export async function updateBusinessBrandingAction(
  businessId: string,
  color: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireBusinessAdmin(businessId);
  if (!isValidHex(color)) {
    return { ok: false, error: "Color inválido" };
  }
  try {
    await getRepositories().businesses.updateBranding(businessId, color, color);
    revalidatePath(ROUTES.admin);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar el color." };
  }
}

/** Instrucciones base de IA por negocio (anuncios y presentaciones). Admin o líder del negocio. */
export async function updateBusinessPromptsAction(
  businessId: string,
  flyerPrompt: string,
  presentationPrompt: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireBusinessAdmin(businessId);
  try {
    await getRepositories().businesses.updatePrompts(
      businessId,
      flyerPrompt.slice(0, 2000),
      presentationPrompt.slice(0, 2000),
    );
    revalidatePath(ROUTES.admin);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudieron guardar las instrucciones." };
  }
}

/** Publica contenido para un negocio (admin de plataforma o de negocio). */
export async function createBusinessContentAction(
  input: NewBusinessContentInput,
): Promise<BusinessContent> {
  await requireRole("leader");
  const content = await getRepositories().businesses.createContent(input);
  revalidatePath(ROUTES.admin);
  return content;
}
