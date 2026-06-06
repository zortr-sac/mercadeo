import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { LessonsManager } from "@/features/admin/lessons-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function CourseLessonsPage({
  params,
}: {
  params: Promise<{ businessId: string; courseId: string }>;
}) {
  const { businessId, courseId } = await params;
  await requireBusinessAdmin(businessId);
  const course = await getRepositories().academy.getCourseById(courseId);
  if (!course || course.businessId !== businessId) notFound();

  return <LessonsManager businessId={businessId} course={course} />;
}
