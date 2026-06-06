"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Profile, SubscriptionState } from "@/data/types";
import { daysUntilExpiry, getSubscriptionState } from "@/lib/subscription";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { recordPaymentAction } from "./subscription-actions";

type BadgeVariant = "success" | "gold" | "destructive" | "muted";

const STATE_BADGE: Record<SubscriptionState, { label: string; variant: BadgeVariant }> = {
  active: { label: "Al día", variant: "success" },
  expiring_soon: { label: "Por vencer", variant: "gold" },
  expired: { label: "Vencido", variant: "destructive" },
  none: { label: "Sin suscripción", variant: "muted" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Texto humano del vencimiento, relativo a hoy. */
function expiryText(expiresAt: string | null): string {
  if (!expiresAt) return "Sin fecha de vencimiento asignada";
  const days = daysUntilExpiry(expiresAt);
  const date = formatDate(expiresAt);
  if (days < 0) return `Venció el ${date} · hace ${Math.abs(days)} día(s)`;
  if (days === 0) return `Vence hoy · ${date}`;
  if (days === 1) return `Vence mañana · ${date}`;
  return `Vence en ${days} días · ${date}`;
}

/**
 * Panel de suscripciones por negocio (solo admin de plataforma). Muestra a cada
 * cliente con su estado y permite registrar el pago del mes ("sin perder días").
 */
export function SubscriptionManager({
  businessId,
  members,
}: {
  businessId: string;
  members: Profile[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actingId, setActingId] = useState<string | null>(null);

  // Vencidos primero, luego los más próximos a vencer (null = al final).
  const sorted = [...members].sort(
    (a, b) =>
      daysUntilExpiry(a.subscriptionExpiresAt) - daysUntilExpiry(b.subscriptionExpiresAt),
  );

  const counts = members.reduce(
    (acc, member) => {
      const state = getSubscriptionState(member.subscriptionExpiresAt);
      if (state === "expired") acc.expired += 1;
      else if (state === "expiring_soon") acc.expiringSoon += 1;
      else if (state === "active") acc.active += 1;
      return acc;
    },
    { expired: 0, expiringSoon: 0, active: 0 },
  );

  function registerPayment(member: Profile) {
    if (!window.confirm(`¿Registrar el pago del mes de ${member.fullName}?`)) return;
    setActingId(member.id);
    startTransition(async () => {
      try {
        const res = await recordPaymentAction(businessId, member.id);
        toast.success(`Pago registrado. Nuevo vencimiento: ${formatDate(res.expiresAt)}.`);
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

      {sorted.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aún no hay clientes"
          description="Cuando este negocio tenga clientes, podrás ver y gestionar sus suscripciones aquí."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((member) => {
            const state = getSubscriptionState(member.subscriptionExpiresAt);
            const badge = STATE_BADGE[state];
            const acting = pending && actingId === member.id;
            return (
              <ManagerRow key={member.id}>
                <Avatar name={member.fullName} src={member.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{member.fullName}</p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {member.phone || member.email}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {expiryText(member.subscriptionExpiresAt)}
                  </p>
                </div>

                <div className="flex shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={acting}
                    disabled={pending}
                    onClick={() => registerPayment(member)}
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
