import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { SubscriptionManager } from "@/features/admin/subscription-manager";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Suscripciones" };

/**
 * Gestión de suscripciones de los clientes de un negocio. Solo el admin de
 * plataforma (requireRole("admin")); un líder que navegue aquí vuelve al inicio.
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

  return <SubscriptionManager businessId={businessId} members={members} />;
}
