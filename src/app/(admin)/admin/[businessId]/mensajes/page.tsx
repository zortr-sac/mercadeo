import { getRepositories } from "@/data";
import { TemplateManager } from "@/features/admin/template-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function MensajesAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  // El repo aplica el patrón multi-tenant: devuelve las del negocio + las globales (null).
  const templates = await getRepositories().duplication.listMessageTemplates({
    businessId,
  });

  return <TemplateManager businessId={businessId} templates={templates} />;
}
