"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import { logActivity } from "@/lib/activity";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";

/** Marks a lesson complete in Supabase (lesson_progress) and logs activity. */
export async function markLessonCompleteAction(lessonId: string): Promise<void> {
  const user = await requireSession();
  await getRepositories().academy.markLessonComplete(user.id, lessonId);
  await logActivity(user.id, user.businessId, "lesson_completed");
  revalidatePath(ROUTES.academia);
}
