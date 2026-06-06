"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { PresentationTemplatePatch } from "@/data/repositories";
import type { PresentationTemplate, PresentationSlide } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "presentaciones"));
}

export async function createPresentationTemplateAction(
  businessId: string,
  input: {
    title: string;
    description: string;
    coverUrl?: string | null;
    fileUrl?: string | null;
    filePath?: string | null;
    fileName?: string | null;
    fileBytes?: number;
    slides?: PresentationSlide[];
    isPublished?: boolean;
  },
): Promise<PresentationTemplate> {
  await requireBusinessAdmin(businessId);
  const tpl = await getRepositories().presentationTemplates.create({ businessId, ...input });
  revalidate(businessId);
  return tpl;
}

export async function updatePresentationTemplateAction(
  businessId: string,
  id: string,
  patch: PresentationTemplatePatch,
): Promise<PresentationTemplate> {
  await requireBusinessAdmin(businessId);
  const tpl = await getRepositories().presentationTemplates.update(id, patch);
  revalidate(businessId);
  return tpl;
}

export async function removePresentationTemplateAction(
  businessId: string,
  id: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().presentationTemplates.remove(id);
  revalidate(businessId);
}
