"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/data";
import { PAYMENT, adminBusinessPath } from "@/lib/constants";
import { requireRole } from "@/lib/session";
import { computeRenewedExpiry } from "@/lib/subscription";

export interface RecordPaymentResult {
  status: "recorded";
  /** Nuevo vencimiento (ISO) tras el pago. */
  expiresAt: string;
}

/**
 * Registra el pago mensual de un cliente. Solo el admin de plataforma puede
 * hacerlo (requireRole("admin")). Extiende el vencimiento "sin perder días"
 * (ver computeRenewedExpiry) y guarda el pago en el historial.
 */
export async function recordPaymentAction(
  businessId: string,
  memberId: string,
): Promise<RecordPaymentResult> {
  const admin = await requireRole("admin");
  const repos = getRepositories();

  const member = await repos.users.getById(memberId);
  if (!member || member.role !== "member" || member.businessId !== businessId) {
    throw new Error("Cliente no encontrado en este negocio.");
  }

  const business = await repos.businesses.getById(businessId);
  const amountPen = business?.subscriptionPricePen ?? PAYMENT.pricePen;
  const periodEnd = computeRenewedExpiry(member.subscriptionExpiresAt);

  await repos.subscriptions.recordPayment({
    memberId,
    businessId,
    amountPen,
    periodEnd,
    recordedBy: admin.id,
  });

  revalidatePath(adminBusinessPath(businessId, "suscripciones"));
  return { status: "recorded", expiresAt: periodEnd };
}
