"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { AdTemplatePatch } from "@/data/repositories";
import type { AdTemplate } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "anuncios"));
}

export async function createAdTemplateAction(
  businessId: string,
  input: {
    title: string;
    bodyText: string;
    category: string;
    imageUrl?: string | null;
    imagePath?: string | null;
    isPublished?: boolean;
  },
): Promise<AdTemplate> {
  await requireBusinessAdmin(businessId);
  const ad = await getRepositories().adTemplates.create({ businessId, ...input });
  revalidate(businessId);
  return ad;
}

export async function updateAdTemplateAction(
  businessId: string,
  id: string,
  patch: AdTemplatePatch,
): Promise<AdTemplate> {
  await requireBusinessAdmin(businessId);
  const ad = await getRepositories().adTemplates.update(id, patch);
  revalidate(businessId);
  return ad;
}

export async function removeAdTemplateAction(
  businessId: string,
  id: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().adTemplates.remove(id);
  revalidate(businessId);
}
