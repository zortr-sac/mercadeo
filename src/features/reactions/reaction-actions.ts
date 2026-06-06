"use server";

import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import type { ContentReactionType } from "@/data/types";

/**
 * Marca/desmarca el corazón del usuario actual sobre un contenido.
 * Devuelve el estado final ({ reacted }). El conteo agregado lo calcula el admin
 * por separado (service-role), sin exponer quién reaccionó.
 */
export async function toggleReactionAction(
  type: ContentReactionType,
  contentId: string,
): Promise<{ reacted: boolean }> {
  const user = await requireSession();
  return getRepositories().reactions.toggle(user.id, user.businessId, type, contentId);
}
