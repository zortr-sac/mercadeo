import type { Metadata } from "next";
import { getRepositories } from "@/data";
import {
  SubscriptionManager,
  type SubscriptionClient,
} from "@/features/admin/subscription-manager";
import {
  daysUntilExpiry,
  formatExpiryLabel,
  getSubscriptionState,
} from "@/lib/subscription";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Suscripciones" };

/**
 * Gestión de suscripciones de los clientes de un negocio. Solo el admin de
 * plataforma (requireRole("admin")). El estado y las etiquetas de vencimiento se
 * calculan AQUÍ (servidor) con una sola referencia de tiempo y zona horaria fija,
 * y se pasan ya listos al client component para evitar desajustes de hidratación.
 */
export default async function SuscripcionesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireRole("admin");

  const members = (await getRepositories().users.list({ businessId })).filter(
    (member) => member.role === "member",
  );

  const now = new Date();
  const clients: SubscriptionClient[] = members
    .map((member) => ({
      member,
      sort: daysUntilExpiry(member.subscriptionExpiresAt, now),
    }))
    .sort((a, b) => a.sort - b.sort) // vencidos primero; sin suscripción al final
    .map(({ member }) => ({
      id: member.id,
      fullName: member.fullName,
      phone: member.phone,
      avatarUrl: member.avatarUrl,
      state: getSubscriptionState(member.subscriptionExpiresAt, now),
      expiryLabel: formatExpiryLabel(member.subscriptionExpiresAt, now),
    }));

  return <SubscriptionManager businessId={businessId} clients={clients} />;
}
