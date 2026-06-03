"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { MessageTemplatePatch } from "@/data/repositories";
import type { MessageTemplate, MessageTone, ScriptCategory } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "mensajes"));
}

export async function createTemplateAction(
  businessId: string,
  input: {
    title: string;
    category: ScriptCategory;
    situation: string;
    baseText: string;
    defaultTone: MessageTone;
    complianceHint: string;
  },
): Promise<MessageTemplate> {
  await requireBusinessAdmin(businessId);
  const template = await getRepositories().duplication.createMessageTemplate({
    businessId,
    ...input,
  });
  revalidate(businessId);
  return template;
}

export async function updateTemplateAction(
  businessId: string,
  id: string,
  patch: MessageTemplatePatch,
): Promise<MessageTemplate> {
  await requireBusinessAdmin(businessId);
  const template = await getRepositories().duplication.updateMessageTemplate(
    id,
    patch,
  );
  revalidate(businessId);
  return template;
}

export async function removeTemplateAction(
  businessId: string,
  id: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().duplication.removeMessageTemplate(id);
  revalidate(businessId);
}
