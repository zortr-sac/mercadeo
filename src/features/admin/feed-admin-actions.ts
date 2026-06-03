"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { PostPatch } from "@/data/repositories";
import type { Post, PostType } from "@/data/types";
import { adminBusinessPath, ROUTES } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "novedades"));
  revalidatePath(ROUTES.feed);
}

export async function createBusinessPostAction(
  businessId: string,
  input: {
    type: PostType;
    title: string;
    body: string;
    eventDate?: string | null;
    eventLocation?: string | null;
    pinned?: boolean;
  },
): Promise<Post> {
  const user = await requireBusinessAdmin(businessId);
  const post = await getRepositories().feed.create({
    businessId,
    authorId: user.id,
    ...input,
  });
  revalidate(businessId);
  return post;
}

export async function updateBusinessPostAction(
  businessId: string,
  postId: string,
  patch: PostPatch,
): Promise<Post> {
  await requireBusinessAdmin(businessId);
  const post = await getRepositories().feed.update(postId, patch);
  revalidate(businessId);
  return post;
}

export async function removeBusinessPostAction(
  businessId: string,
  postId: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().feed.remove(postId);
  revalidate(businessId);
}
