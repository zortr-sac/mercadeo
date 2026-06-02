"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { Learning } from "@/data/types";
import { logActivity } from "@/lib/activity";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";

/** Guarda un aprendizaje (un "no" reencuadrado) y cuenta como actividad. */
export async function saveLearningAction(input: {
  situation: string;
  reframe: string | null;
}): Promise<Learning> {
  const user = await requireSession();
  const learning = await getRepositories().learnings.create({
    userId: user.id,
    businessId: user.businessId,
    situation: input.situation.trim(),
    reframe: input.reframe,
  });
  await logActivity(user.id, user.businessId, "learning_logged");
  revalidatePath(ROUTES.constancia);
  return learning;
}

/** Registra que el usuario completó una lección (gamificación por actividad). */
export async function logLessonCompletedAction(): Promise<void> {
  const user = await requireSession();
  await logActivity(user.id, user.businessId, "lesson_completed");
  revalidatePath(ROUTES.constancia);
}
