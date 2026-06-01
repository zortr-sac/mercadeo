import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { requireSession } from "@/lib/session";
import { LessonView } from "@/features/academy/lesson-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const data = await getRepositories().academy.getLesson(courseSlug, lessonSlug);
  return { title: data?.lesson.title ?? "Lección" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  await requireSession();
  const { courseSlug, lessonSlug } = await params;
  const data = await getRepositories().academy.getLesson(courseSlug, lessonSlug);
  if (!data) notFound();

  return (
    <Container>
      <LessonView course={data.course} lesson={data.lesson} />
    </Container>
  );
}
