"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { MessageTemplatePatch } from "@/data/repositories";
import type { MessageTemplate } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "mensajes"));
}

export async function createTemplateAction(
  businessId: string,
  input: { title: string; situation: string; systemPrompt: string; baseText: string },
): Promise<MessageTemplate> {
  await requireBusinessAdmin(businessId);
  const template = await getRepositories().duplication.createMessageTemplate({
    businessId,
    title: input.title,
    // `situation` = descripción breve que ve el miembro.
    situation: input.situation,
    systemPrompt: input.systemPrompt,
    baseText: input.baseText,
    // Campos heredados (los usa el copiloto de prospectos); valores neutrales por defecto.
    category: "prospecting",
    defaultTone: "warm",
    complianceHint: "",
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
