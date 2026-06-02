import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";

const subscriptionSchema = z.object({
  idempotencyKey: z.string().min(8),
  businessId: z.string().nullable().optional(),
  subscription: z.object({
    endpoint: z.string().url(),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

export async function POST(request: Request) {
  const user = await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = subscriptionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Suscripcion push invalida", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { subscription, businessId } = parsed.data;
  const supabase = await createClient();

  // Upsert idempotente por endpoint (re-activa si estaba deshabilitada).
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      business_id: businessId ?? user.businessId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: request.headers.get("user-agent"),
      disabled_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar la suscripcion" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: parsed.data.idempotencyKey });
}
