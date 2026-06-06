"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { SubscriptionState } from "@/data/types";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { recordPaymentAction } from "./subscription-actions";

/** Cliente con sus datos de suscripción ya calculados en el servidor. */
export interface SubscriptionClient {
  id: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  state: SubscriptionState;
  expiryLabel: string;
}

type BadgeVariant = "success" | "gold" | "destructive" | "muted";

const STATE_BADGE: Record<SubscriptionState, { label: string; variant: BadgeVariant }> = {
  active: { label: "Al día", variant: "success" },
  expiring_soon: { label: "Por vencer", variant: "gold" },
  expired: { label: "Vencido", variant: "destructive" },
  none: { label: "Sin suscripción", variant: "muted" },
};

/**
 * Panel de suscripciones por negocio (solo admin de plataforma). Recibe los
 * clientes ya ordenados y con su estado/etiqueta calculados en el servidor, y
 * permite registrar el pago del mes ("sin perder días").
 */
export function SubscriptionManager({
  businessId,
  clients,
}: {
  businessId: string;
  clients: SubscriptionClient[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actingId, setActingId] = useState<string | null>(null);

  const counts = clients.reduce(
    (acc, client) => {
      if (client.state === "expired") acc.expired += 1;
      else if (client.state === "expiring_soon") acc.expiringSoon += 1;
      else if (client.state === "active") acc.active += 1;
      return acc;
    },
    { expired: 0, expiringSoon: 0, active: 0 },
  );

  function registerPayment(client: SubscriptionClient) {
    if (!window.confirm(`¿Registrar el pago del mes de ${client.fullName}?`)) return;
    setActingId(client.id);
    startTransition(async () => {
      try {
        const res = await recordPaymentAction(businessId, client.id);
        const date = new Date(res.expiresAt).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "America/Lima",
        });
        toast.success(`Pago registrado. Nuevo vencimiento: ${date}.`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo registrar el pago.",
        );
      } finally {
        setActingId(null);
      }
    });
  }

  return (
    <ManagerCard>
      <ManagerHeader
        icon={Wallet}
        title="Suscripciones de clientes"
        description="Revisa cuánto le falta a cada cliente y registra su pago mensual. Al registrar un pago, el vencimiento se extiende un mes sin perder los días que aún le quedaban."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="destructive">{counts.expired} vencidos</Badge>
        <Badge variant="gold">{counts.expiringSoon} por vencer</Badge>
        <Badge variant="success">{counts.active} al día</Badge>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aún no hay clientes"
          description="Cuando este negocio tenga clientes, podrás ver y gestionar sus suscripciones aquí."
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const badge = STATE_BADGE[client.state];
            const acting = pending && actingId === client.id;
            return (
              <ManagerRow key={client.id}>
                <Avatar name={client.fullName} src={client.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{client.fullName}</p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {client.phone || "Sin teléfono"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{client.expiryLabel}</p>
                </div>
                <div className="flex shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={acting}
                    disabled={pending}
                    onClick={() => registerPayment(client)}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    Registrar pago
                  </Button>
                </div>
              </ManagerRow>
            );
          })}
        </div>
      )}
    </ManagerCard>
  );
}
