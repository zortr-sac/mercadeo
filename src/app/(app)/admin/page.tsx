import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import type { BusinessContent } from "@/data/types";
import { BusinessAdmin } from "@/features/admin/business-admin";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Admin plataforma" };

export default async function AdminPage() {
  await requireRole("admin");
  const repos = getRepositories();
  const businesses = await repos.businesses.list();
  const contentEntries = await Promise.all(
    businesses.map(
      async (business) =>
        [business.id, await repos.businesses.listContent(business.id)] as const,
    ),
  );
  const contentByBusiness: Record<string, BusinessContent[]> =
    Object.fromEntries(contentEntries);

  return (
    <Container className="max-w-7xl">
      <PageHeader
        title="Admin plataforma"
        subtitle="Crea negocios, define marca, conecta dominio, copia link de registro y publica contenido."
      />
      <div className="mt-6">
        <BusinessAdmin
          businesses={businesses}
          contentByBusiness={contentByBusiness}
        />
      </div>
    </Container>
  );
}
