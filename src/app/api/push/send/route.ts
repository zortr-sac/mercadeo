import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { sendPushToUser } from "@/lib/push/send";

const requestSchema = z.object({
  title: z.string().max(80).default("Seguimiento pendiente"),
  body: z.string().max(200).default("Hoy te toca escribirle a un prospecto."),
  url: z.string().max(200).default("/duplicacion/prospectos"),
});

export async function POST(request: Request) {
  const user = await requireSession();

  const json = await request.json().catch(() => ({}));
  const payload = requestSchema.parse(json ?? {});

  const supabase = await createClient();
  const { sent, failed } = await sendPushToUser(supabase, user.id, payload);

  if (sent === 0 && failed === 0) {
    return NextResponse.json(
      { error: "No tienes notificaciones activadas en este dispositivo." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: sent > 0, sent, failed });
}
