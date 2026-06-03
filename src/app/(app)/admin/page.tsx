import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ChevronRight, Users } from "lucide-react";
import { getRepositories } from "@/data";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateBusinessForm } from "@/features/admin/create-business-form";
import { adminBusinessPath } from "@/lib/constants";
import { requireRole } from "@/lib/session";
import type { BusinessStatus } from "@/data/types";

export const metadata: Metadata = { title: "Panel de administración" };

const STATUS_META: Record<
  BusinessStatus,
  { label: string; variant: "success" | "muted" | "destructive" }
> = {
  active: { label: "Activo", variant: "success" },
  draft: { label: "Borrador", variant: "muted" },
  suspended: { label: "Suspendido", variant: "destructive" },
};

export default async function AdminPage() {
  const user = await requireRole("leader");

  // El admin de negocio (líder) gestiona solo el suyo: va directo a su hub.
  if (user.role === "leader" && user.businessId) {
    redirect(adminBusinessPath(user.businessId, "resumen"));
  }

  const businesses = await getRepositories().businesses.list();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-base font-medium text-brand-700 dark:text-brand-300">
            Panel de administración
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Negocios de la plataforma
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Crea negocios, entra a su hub y gestiona su contenido, equipo y marca.
          </p>
        </div>
        <CreateBusinessForm />
      </div>

      {businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aún no hay negocios"
          description="Crea el primer negocio para empezar a configurar su academia, audiolibros y equipo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => {
            const status = STATUS_META[business.status];
            return (
              <Link
                key={business.id}
                href={adminBusinessPath(business.id)}
                className="group flex flex-col rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${business.primaryColor}, ${business.accentColor})`,
                    }}
                    aria-hidden
                  >
                    {business.name.slice(0, 2).toUpperCase()}
                  </span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <h2 className="mt-4 font-display text-xl font-bold leading-tight tracking-tight">
                  {business.name}
                </h2>
                <p className="mt-1 truncate text-base text-muted-foreground">
                  {business.adminEmail}
                </p>
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-base text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" aria-hidden />
                    {business.memberCount} clientes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-4" aria-hidden />
                    {business.contentCount} contenidos
                  </span>
                  <ChevronRight className="ml-auto size-5 text-brand-600 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
