"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { ProspectPatch } from "@/data/repositories";
import type { Prospect, ProspectInterest, ProspectStage } from "@/data/types";
import { logActivity } from "@/lib/activity";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";

interface ProspectDraftInput {
  name: string;
  phone: string | null;
  email: string | null;
  stage: ProspectStage;
  interest: ProspectInterest;
  notes: string;
  nextActionAt: string | null;
}

/** Crea un prospecto para el usuario autenticado (owner + business desde la sesión). */
export async function createProspectAction(
  draft: ProspectDraftInput,
): Promise<Prospect> {
  const user = await requireSession();
  const prospect = await getRepositories().prospects.create({
    ...draft,
    ownerId: user.id,
    businessId: user.businessId,
  });
  await logActivity(user.id, user.businessId, "prospect_added");
  revalidatePath(ROUTES.prospectos);
  return prospect;
}

/** Actualiza campos de un prospecto propio. */
export async function updateProspectAction(
  id: string,
  patch: ProspectPatch,
): Promise<Prospect> {
  await requireSession();
  const prospect = await getRepositories().prospects.update(id, patch);
  revalidatePath(ROUTES.prospectos);
  return prospect;
}

/** Mueve un prospecto a otra etapa del pipeline. */
export async function moveProspectAction(
  id: string,
  stage: ProspectStage,
): Promise<Prospect> {
  await requireSession();
  const prospect = await getRepositories().prospects.update(id, { stage });
  revalidatePath(ROUTES.prospectos);
  return prospect;
}

/** Elimina un prospecto propio. */
export async function deleteProspectAction(id: string): Promise<void> {
  await requireSession();
  await getRepositories().prospects.remove(id);
  revalidatePath(ROUTES.prospectos);
}
