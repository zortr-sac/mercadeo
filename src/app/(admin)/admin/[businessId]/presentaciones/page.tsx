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
  const templates = await getRepositories().presentationTemplates.listAdmin(businessId);

  return <PresentationTemplateManager businessId={businessId} templates={templates} />;
}
