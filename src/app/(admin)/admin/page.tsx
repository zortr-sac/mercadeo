import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Building2, Clock, Eye, Settings2, Users } from "lucide-react";
import { getRepositories } from "@/data";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateBusinessForm } from "@/features/admin/create-business-form";
import { enterBusinessPreviewAction } from "@/features/admin/preview-actions";
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

const BTN_SECONDARY =
  "inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-background px-4 py-2.5 text-base font-medium transition-colors hover:bg-muted";
const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-700";

export default async function AdminPage() {
  const user = await requireRole("leader");

  // El admin de negocio (líder) gestiona solo el suyo: va directo a su hub.
  if (user.role === "leader" && user.businessId) {
    redirect(adminBusinessPath(user.businessId, "resumen"));
  }

  const repos = getRepositories();
  const [businesses, expiryByBusiness] = await Promise.all([
    repos.businesses.list(),
    repos.subscriptions.getExpirySummaryByBusiness(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-base font-medium text-brand-700 dark:text-brand-300">Panel NetScale</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Tus negocios</h1>
          <p className="mt-1 max-w-2xl text-base text-muted-foreground">
            Crea negocios, gestiona su contenido y entra a cada uno como un miembro para verlo por dentro.
          </p>
        </div>
        <CreateBusinessForm />
      </div>

      {/* Negocios */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Negocios <span className="text-muted-foreground">({businesses.length})</span>
        </h2>
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
              const summary = expiryByBusiness[business.id];
              const expired = summary?.expired ?? 0;
              const expiringSoon = summary?.expiringSoon ?? 0;
              return (
                <div
                  key={business.id}
                  className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${business.primaryColor}, ${business.accentColor})` }}
                      aria-hidden
                    >
                      {business.name.slice(0, 2).toUpperCase()}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-tight tracking-tight">
                    {business.name}
                  </h3>
                  <p className="mt-1 truncate text-base text-muted-foreground">{business.adminEmail}</p>
                  <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-base text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4" aria-hidden />
                      {business.memberCount} clientes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-4" aria-hidden />
                      {business.contentCount} contenidos
                    </span>
                  </div>
                  <Link
                    href={adminBusinessPath(business.id, "suscripciones")}
                    className="mt-3 flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 font-medium ${
                        expired > 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <AlertTriangle className="size-3.5" aria-hidden />
                      {expired} vencidos
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-muted px-2 py-1 font-medium text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      {expiringSoon} por vencer
                    </span>
                  </Link>
                  <div className="mt-5 flex gap-2">
                    <Link href={adminBusinessPath(business.id)} className={`flex-1 ${BTN_SECONDARY}`}>
                      <Settings2 className="size-4" aria-hidden />
                      Gestionar
                    </Link>
                    <form action={enterBusinessPreviewAction.bind(null, business.id)} className="flex-1">
                      <button type="submit" className={BTN_PRIMARY}>
                        <Eye className="size-4" aria-hidden />
                        Ver como miembro
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
