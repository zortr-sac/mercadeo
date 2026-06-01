import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { requireSession } from "@/lib/session";
import { CourseDetail } from "@/features/academy/course-detail";

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
  await requireSession();
  const { courseSlug } = await params;
  const course = await getRepositories().academy.getCourseBySlug(courseSlug);
  if (!course) notFound();

  return (
    <Container>
      <CourseDetail course={course} />
    </Container>
  );
}
