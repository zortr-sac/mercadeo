"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import type { CoursePatch, LessonPatch } from "@/data/repositories";
import type { Course, CourseLevel, Lesson, LessonType } from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

function revalidate(businessId: string) {
  revalidatePath(adminBusinessPath(businessId, "academia"));
}

export async function createCourseAction(
  businessId: string,
  input: {
    title: string;
    description: string;
    level: CourseLevel;
    category: string;
    estimatedMinutes: number;
    isPublished: boolean;
  },
): Promise<Course> {
  await requireBusinessAdmin(businessId);
  const course = await getRepositories().academy.createCourse({
    businessId,
    ...input,
  });
  revalidate(businessId);
  return course;
}

export async function updateCourseAction(
  businessId: string,
  courseId: string,
  patch: CoursePatch,
): Promise<Course> {
  await requireBusinessAdmin(businessId);
  const course = await getRepositories().academy.updateCourse(courseId, patch);
  revalidate(businessId);
  return course;
}

export async function removeCourseAction(
  businessId: string,
  courseId: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().academy.removeCourse(courseId);
  revalidate(businessId);
}

/** Crea una lección (asegurando un módulo "Contenido" en el curso). */
export async function createLessonAction(
  businessId: string,
  courseId: string,
  input: {
    title: string;
    contentType: LessonType;
    videoUrl?: string | null;
    content?: string | null;
    durationMinutes?: number;
  },
): Promise<Lesson> {
  await requireBusinessAdmin(businessId);
  const repos = getRepositories();
  const courseModule = await repos.academy.ensureModule(courseId, "Contenido");
  const lesson = await repos.academy.createLesson({
    courseId,
    moduleId: courseModule.id,
    ...input,
  });
  revalidate(businessId);
  return lesson;
}

export async function updateLessonAction(
  businessId: string,
  lessonId: string,
  patch: LessonPatch,
): Promise<Lesson> {
  await requireBusinessAdmin(businessId);
  const lesson = await getRepositories().academy.updateLesson(lessonId, patch);
  revalidate(businessId);
  return lesson;
}

export async function removeLessonAction(
  businessId: string,
  lessonId: string,
): Promise<void> {
  await requireBusinessAdmin(businessId);
  await getRepositories().academy.removeLesson(lessonId);
  revalidate(businessId);
}
