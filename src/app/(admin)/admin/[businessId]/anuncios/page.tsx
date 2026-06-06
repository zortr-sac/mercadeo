import { getRepositories } from "@/data";
import { AdTemplateManager } from "@/features/admin/ad-template-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function AdTemplatesAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const repos = getRepositories();
  const [templates, counts] = await Promise.all([
    repos.adTemplates.listAdmin(businessId),
    repos.reactions.getCounts("ad", businessId),
  ]);

  return (
    <AdTemplateManager businessId={businessId} templates={templates} counts={counts} />
  );
}
