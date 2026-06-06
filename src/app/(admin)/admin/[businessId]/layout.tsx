import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { AdminTabs } from "@/features/admin/admin-tabs";
import { BusinessHubHeader } from "@/features/admin/business-hub-header";
import { requireBusinessAdmin } from "@/lib/session";

/**
 * Layout del hub de administración por negocio: encabezado del negocio +
 * pestañas de gestión. Exige ser admin de plataforma o líder de ESTE negocio.
 */
export default async function BusinessAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const user = await requireBusinessAdmin(businessId);
  const business = await getRepositories().businesses.getById(businessId);
  if (!business) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 lg:px-6">
      <BusinessHubHeader
        business={business}
        isPlatformAdmin={user.role === "admin"}
      />
      <AdminTabs businessId={businessId} isPlatformAdmin={user.role === "admin"} />
      {children}
    </div>
  );
}
