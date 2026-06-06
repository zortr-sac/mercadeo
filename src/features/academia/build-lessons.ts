import type { CourseWithContent } from "@/data/types";

export type LessonState = "done" | "next" | "lock";

export interface LessonItem {
  courseSlug: string;
  slug: string;
  title: string;
  dur: number;
  state: LessonState;
}

/**
 * Flattens a course's lessons into a single progress-gated list: completed
 * lessons are "done", the first uncompleted one is "next", and the rest "lock".
 * Accepts an array so a course's multiple modules collapse into one ordered list.
 */
export function buildBlockLessons(
  courses: CourseWithContent[],
  completed: Set<string>,
): { items: LessonItem[]; summary: { completed: number; total: number } } {
  const flat = courses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons).map((lesson) => ({ courseSlug: c.slug, lesson })),
  );
  const firstUncompletedIdx = flat.findIndex(({ lesson }) => !completed.has(lesson.id));
  const items: LessonItem[] = flat.map(({ courseSlug, lesson }, i) => ({
    courseSlug,
    slug: lesson.slug,
    title: lesson.title,
    dur: lesson.durationMinutes,
    state: completed.has(lesson.id) ? "done" : i === firstUncompletedIdx ? "next" : "lock",
  }));
  const completedCount = flat.filter(({ lesson }) => completed.has(lesson.id)).length;
  return { items, summary: { completed: completedCount, total: flat.length } };
}
