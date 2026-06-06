import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { sendPushToUser } from "@/lib/push/send";
import { ROUTES, SUBSCRIPTION } from "@/lib/constants";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
// Perú no usa horario de verano: UTC-5 fijo.
const PERU_OFFSET_MS = 5 * 60 * 60 * 1000;

/**
 * Cron diario (Vercel) que envía el recordatorio push a los clientes cuya
 * suscripción vence dentro de `SUBSCRIPTION.reminderDaysBefore` días (mañana).
 * Vercel inyecta `Authorization: Bearer <CRON_SECRET>`; sin secreto válido → 401.
 * Usa service-role porque corre sin sesión de usuario.
 */
export async function GET(request: Request) {
  const secret = serverEnv.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Ventana = el día completo (hora Perú) que cae `reminderDaysBefore` días después
  // de hoy. Trabajamos los componentes de fecha en Perú y convertimos a UTC al final.
  const peruNow = new Date(Date.now() - PERU_OFFSET_MS);
  const startOfTodayPeru = Date.UTC(
    peruNow.getUTCFullYear(),
    peruNow.getUTCMonth(),
    peruNow.getUTCDate(),
  );
  const windowStartPeru = startOfTodayPeru + SUBSCRIPTION.reminderDaysBefore * DAY_MS;
  // De "medianoche Perú" (expresada como UTC) al instante UTC real: +5h.
  const windowStart = new Date(windowStartPeru + PERU_OFFSET_MS);
  const windowEnd = new Date(windowStartPeru + DAY_MS + PERU_OFFSET_MS);

  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("profiles")
    .select("id, subscription_expires_at")
    .eq("role", "member")
    .gte("subscription_expires_at", windowStart.toISOString())
    .lt("subscription_expires_at", windowEnd.toISOString())
    .is("subscription_reminder_sent_at", null);

  if (error) {
    return NextResponse.json(
      { error: "No se pudo leer la lista de vencimientos." },
      { status: 500 },
    );
  }

  const notifiedIds: string[] = [];
  for (const member of members ?? []) {
    const { sent } = await sendPushToUser(admin, member.id as string, {
      title: "Tu suscripción vence mañana",
      body: "Renueva a tiempo para no perder tu acceso.",
      url: ROUTES.perfil,
    });
    if (sent > 0) notifiedIds.push(member.id as string);
  }

  // Marca el recordatorio como enviado para no repetirlo en corridas posteriores.
  // (Al registrar un pago, recordPayment vuelve a poner este campo en null.)
  if (notifiedIds.length > 0) {
    await admin
      .from("profiles")
      .update({ subscription_reminder_sent_at: new Date().toISOString() })
      .in("id", notifiedIds);
  }

  return NextResponse.json({
    ok: true,
    candidates: members?.length ?? 0,
    notified: notifiedIds.length,
  });
}
