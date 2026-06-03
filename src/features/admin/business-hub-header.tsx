"use client";

import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { Business, BusinessStatus } from "@/data/types";

const STATUS_META: Record<
  BusinessStatus,
  { label: string; variant: "success" | "muted" | "destructive" }
> = {
  active: { label: "Activo", variant: "success" },
  draft: { label: "Borrador", variant: "muted" },
  suspended: { label: "Suspendido", variant: "destructive" },
};

function registrationUrl(business: Business): string {
  const origin =
    typeof window === "undefined" ? "" : window.location.origin;
  return business.customDomain
    ? `https://${business.customDomain}${business.registrationPath}`
    : `${origin}${business.registrationPath}`;
}

/**
 * Encabezado del hub de administración de un negocio: identidad del negocio,
 * estado, copiar link de registro y (para admin de plataforma) volver al listado.
 */
export function BusinessHubHeader({
  business,
  isPlatformAdmin,
}: {
  business: Business;
  isPlatformAdmin: boolean;
}) {
  const status = STATUS_META[business.status];

  async function copyRegistration() {
    try {
      await navigator.clipboard.writeText(registrationUrl(business));
      toast.success("Link de registro copiado.");
    } catch {
      toast.error("No se pudo copiar el link. Cópialo manualmente.");
    }
  }

  return (
    <header className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
      {isPlatformAdmin && (
        <Link
          href={ROUTES.admin}
          className="mb-3 inline-flex items-center gap-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Todos los negocios
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-xl font-bold text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${business.primaryColor}, ${business.accentColor})`,
            }}
            aria-hidden
          >
            {business.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {business.name}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="mt-0.5 text-base text-muted-foreground">
              Panel de administración del negocio
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={copyRegistration}>
          <Copy className="size-5" aria-hidden />
          Copiar link de registro
        </Button>
      </div>
    </header>
  );
}
