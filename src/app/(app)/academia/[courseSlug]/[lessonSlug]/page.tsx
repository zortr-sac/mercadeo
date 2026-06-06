import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { VideoLessonScreen } from "@/features/academia/video-lesson-screen";
import { ROUTES } from "@/lib/constants";

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
  const user = await requireSession();
  const { courseSlug, lessonSlug } = await params;
  const repos = getRepositories();
  const data = await repos.academy.getLesson(courseSlug, lessonSlug);
  if (!data) notFound();

  const completed = new Set(await repos.academy.getCompletedLessonIds(user.id));
  const lessons = data.course.modules.flatMap((m) => m.lessons);
  const idx = lessons.findIndex((l) => l.id === data.lesson.id);
  const next = idx >= 0 ? lessons[idx + 1] : undefined;
  const nextHref = next ? `${ROUTES.academia}/${courseSlug}/${next.slug}` : null;

  return (
    <VideoLessonScreen
      courseTitle={data.course.title}
      lessonId={data.lesson.id}
      lessonTitle={data.lesson.title}
      videoUrl={data.lesson.videoUrl}
      alreadySeen={completed.has(data.lesson.id)}
      nextHref={nextHref}
    />
  );
}
