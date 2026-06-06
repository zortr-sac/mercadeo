import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { SettingsManager } from "@/features/admin/settings-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function AjustesAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const business = await getRepositories().businesses.getById(businessId);
  if (!business) notFound();

  return <SettingsManager business={business} />;
}
