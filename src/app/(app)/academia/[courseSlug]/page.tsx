import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { buildBlockLessons } from "@/features/academia/build-lessons";
import { BlockLessonsScreen } from "@/features/academia/block-lessons-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getRepositories().academy.getCourseBySlug(courseSlug);
  return { title: course?.title ?? "Curso" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const user = await requireSession();
  const { courseSlug } = await params;
  const repos = getRepositories();
  const course = await repos.academy.getCourseBySlug(courseSlug);
  if (!course) notFound();

  const completed = new Set(await repos.academy.getCompletedLessonIds(user.id));
  const { items, summary } = buildBlockLessons([course], completed);
  return (
    <BlockLessonsScreen title={course.title} summary={summary} items={items} course={course} />
  );
}
