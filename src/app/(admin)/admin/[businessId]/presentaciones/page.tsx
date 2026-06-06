import { getRepositories } from "@/data";
import { PresentationTemplateManager } from "@/features/admin/presentation-template-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function PresentationTemplatesAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const repos = getRepositories();
  const [templates, counts] = await Promise.all([
    repos.presentationTemplates.listAdmin(businessId),
    repos.reactions.getCounts("presentation", businessId),
  ]);

  return (
    <PresentationTemplateManager
      businessId={businessId}
      templates={templates}
      counts={counts}
    />
  );
}
