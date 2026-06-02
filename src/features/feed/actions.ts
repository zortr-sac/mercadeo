"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import { logActivity } from "@/lib/activity";
import { ROUTES } from "@/lib/constants";
import { can } from "@/lib/rbac";
import { requireSession } from "@/lib/session";
import { newPostSchema } from "./schema";

/** Alterna una reacción a una publicación. */
export async function toggleReactionAction(
  postId: string,
  delta: 1 | -1,
): Promise<number> {
  await requireSession();
  return getRepositories().feed.toggleReaction(postId, delta);
}

export type CreatePostState = { error?: string; ok?: boolean };

/** Crea una publicación (solo líder/admin). Validación server-side con Zod. */
export async function createPostAction(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const user = await requireSession();
  if (!can(user.role, "feed.create")) {
    return { error: "No tienes permisos para publicar." };
  }

  const parsed = newPostSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    body: formData.get("body"),
    eventDate: formData.get("eventDate") || null,
    eventLocation: formData.get("eventLocation") || null,
    pinned: can(user.role, "feed.pin") && formData.get("pinned") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await getRepositories().feed.create({
    ...parsed.data,
    authorId: user.id,
    businessId: user.businessId,
  });
  await logActivity(user.id, user.businessId, "post_created");
  revalidatePath(ROUTES.feed);
  return { ok: true };
}
