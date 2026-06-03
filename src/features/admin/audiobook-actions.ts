"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { AudiobookPatch } from "@/data/repositories";
import type { Audiobook } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "audiolibros"));
}

export async function createAudiobookAction(
  businessId: string,
  input: {
    title: string;
    author: string;
    description: string;
    category: string;
    coverUrl?: string | null;
    audioUrl?: string | null;
    audioPath?: string | null;
    durationSeconds?: number;
    isPublished?: boolean;
  },
): Promise<Audiobook> {
  await requireBusinessAdmin(businessId);
  const audiobook = await getRepositories().audiobooks.create({
    businessId,
    ...input,
  });
  revalidate(businessId);
  return audiobook;
}

export async function updateAudiobookAction(
  businessId: string,
  id: string,
  patch: AudiobookPatch,
): Promise<Audiobook> {
  await requireBusinessAdmin(businessId);
  const audiobook = await getRepositories().audiobooks.update(id, patch);
  revalidate(businessId);
  return audiobook;
}

export async function removeAudiobookAction(
  businessId: string,
  id: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().audiobooks.remove(id);
  revalidate(businessId);
}
