"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type {
  NewBusinessContentInput,
  NewBusinessInput,
} from "@/data/repositories";
import type { Business, BusinessContent } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { requireRole } from "@/lib/session";

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

/** Publica contenido para un negocio (admin de plataforma o de negocio). */
export async function createBusinessContentAction(
  input: NewBusinessContentInput,
): Promise<BusinessContent> {
  await requireRole("leader");
  const content = await getRepositories().businesses.createContent(input);
  revalidatePath(ROUTES.admin);
  return content;
}
