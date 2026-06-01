import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { requireSession } from "@/lib/session";
import { CourseCatalog } from "@/features/academy/course-catalog";

export const metadata: Metadata = { title: "Academia" };

export default async function AcademiaPage() {
  await requireSession();
  const courses = await getRepositories().academy.listCourses();

  return (
    <Container>
      <PageHeader
        title="Academia"
        subtitle="Fórmate paso a paso. Aprende, aplica y duplica."
      />
      <div className="mt-6">
        <CourseCatalog courses={courses} />
      </div>
    </Container>
  );
}
