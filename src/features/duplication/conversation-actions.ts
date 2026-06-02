"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { ProspectInteraction } from "@/data/types";
import { logActivity } from "@/lib/activity";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";

function prospectPath(prospectId: string) {
  return `${ROUTES.prospectos}/${prospectId}`;
}

/**
 * Guarda en la memoria del prospecto un turno de conversación:
 * lo que dijo el cliente y (opcionalmente) lo que el vendedor respondió.
 * Actualiza la ficha IA si se entrega.
 */
export async function recordExchangeAction(
  prospectId: string,
  payload: {
    clientSaid: string;
    sellerReplied?: string | null;
    profile?: string | null;
    source?: string;
  },
): Promise<void> {
  const user = await requireSession();
  const repos = getRepositories();
  const prospect = await repos.prospects.getById(prospectId);
  if (!prospect || prospect.ownerId !== user.id) {
    throw new Error("Prospecto no encontrado");
  }

  if (payload.clientSaid.trim()) {
    await repos.interactions.create({
      prospectId,
      ownerId: user.id,
      businessId: prospect.businessId,
      role: "prospect",
      content: payload.clientSaid.trim(),
      source: payload.source ?? "screenshot",
    });
  }

  if (payload.sellerReplied?.trim()) {
    await repos.interactions.create({
      prospectId,
      ownerId: user.id,
      businessId: prospect.businessId,
      role: "seller",
      content: payload.sellerReplied.trim(),
      source: "ai",
    });
  }

  if (payload.profile?.trim()) {
    await repos.prospects.setAiProfile(prospectId, payload.profile.trim());
  }

  await logActivity(user.id, prospect.businessId, "conversation_used");
  revalidatePath(prospectPath(prospectId));
}

/** Agrega una nota manual del vendedor a la memoria del prospecto. */
export async function addProspectNoteAction(
  prospectId: string,
  note: string,
): Promise<ProspectInteraction> {
  const user = await requireSession();
  const repos = getRepositories();
  const prospect = await repos.prospects.getById(prospectId);
  if (!prospect || prospect.ownerId !== user.id) {
    throw new Error("Prospecto no encontrado");
  }
  const interaction = await repos.interactions.create({
    prospectId,
    ownerId: user.id,
    businessId: prospect.businessId,
    role: "note",
    content: note.trim(),
    source: "manual",
  });
  revalidatePath(prospectPath(prospectId));
  return interaction;
}

/** Elimina una entrada de la memoria. */
export async function deleteInteractionAction(
  prospectId: string,
  interactionId: string,
): Promise<void> {
  await requireSession();
  await getRepositories().interactions.remove(interactionId);
  revalidatePath(prospectPath(prospectId));
}
