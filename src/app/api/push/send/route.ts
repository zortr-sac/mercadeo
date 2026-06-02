import { NextResponse } from "next/server";
import { z } from "zod";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { env, serverEnv } from "@/lib/env";
import { requireSession } from "@/lib/session";

const requestSchema = z.object({
  title: z.string().max(80).default("Seguimiento pendiente"),
  body: z.string().max(200).default("Hoy te toca escribirle a un prospecto."),
  url: z.string().max(200).default("/duplicacion/prospectos"),
});

export async function POST(request: Request) {
  const user = await requireSession();

  const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = serverEnv.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: "Push no configurado (faltan llaves VAPID)." },
      { status: 503 },
    );
  }
  webpush.setVapidDetails(serverEnv.VAPID_SUBJECT, publicKey, privateKey);

  const json = await request.json().catch(() => ({}));
  const payload = requestSchema.parse(json ?? {});

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", user.id)
    .is("disabled_at", null);

  if (error) {
    return NextResponse.json({ error: "No se pudieron leer las suscripciones" }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: "No tienes notificaciones activadas en este dispositivo." },
      { status: 404 },
    );
  }

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint as string,
            keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
          },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (sendError: unknown) {
        failed += 1;
        const status = (sendError as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.id as string);
      }
    }),
  );

  // Limpia suscripciones expiradas.
  if (expired.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ disabled_at: new Date().toISOString() })
      .in("id", expired);
  }

  return NextResponse.json({ ok: sent > 0, sent, failed });
}
