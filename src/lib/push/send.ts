import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface PushSendResult {
  sent: number;
  failed: number;
}

let vapidConfigured = false;

/** Configura VAPID una sola vez por proceso. Devuelve false si faltan llaves. */
function ensureVapid(): boolean {
  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = serverEnv.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (!vapidConfigured) {
    webpush.setVapidDetails(serverEnv.VAPID_SUBJECT, publicKey, privateKey);
    vapidConfigured = true;
  }
  return true;
}

/**
 * Envía una notificación push a TODAS las suscripciones activas de un usuario y
 * desactiva (disabled_at) las que el push service reporta como expiradas (404/410).
 *
 * `client` debe poder leer/actualizar push_subscriptions del usuario: el cliente
 * con la sesión del propio usuario (RLS owner) o el service-role para envíos del
 * sistema (p. ej. el cron de recordatorios, que no tiene sesión).
 */
export async function sendPushToUser(
  client: SupabaseClient,
  userId: string,
  payload: PushPayload,
): Promise<PushSendResult> {
  if (!ensureVapid()) return { sent: 0, failed: 0 };

  const { data: subs, error } = await client
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)
    .is("disabled_at", null);

  if (error || !subs || subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];
  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint as string,
            keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
          },
          body,
        );
        sent += 1;
      } catch (sendError: unknown) {
        failed += 1;
        const status = (sendError as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.id as string);
      }
    }),
  );

  if (expired.length > 0) {
    await client
      .from("push_subscriptions")
      .update({ disabled_at: new Date().toISOString() })
      .in("id", expired);
  }

  return { sent, failed };
}
