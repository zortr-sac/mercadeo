import { getRepositories } from "@/data";
import { AcademyManager } from "@/features/admin/academy-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function AcademiaAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const courses = await getRepositories().academy.listCoursesAdmin(businessId);

  return <AcademyManager businessId={businessId} courses={courses} />;
}
