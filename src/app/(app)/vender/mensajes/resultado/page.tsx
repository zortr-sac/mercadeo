import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import type { MessageTone } from "@/data/types";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { MensajeResultadoScreen, type MessageGen } from "@/features/vender/mensaje-resultado-screen";

export const metadata: Metadata = { title: "Tu mensaje" };

const TONES: MessageTone[] = ["calm", "warm", "direct", "reactivation"];

export default async function MensajeResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const user = await requireSession();
  const { template } = await searchParams;
  if (!template) notFound();

  const { businessId } = await getEffectiveBusiness(user);
  const templates = await getRepositories().duplication.listMessageTemplates({ businessId });
  const t = templates.find((x) => x.id === template);
  if (!t) notFound();

  const apiTone: MessageTone = TONES.includes(t.defaultTone) ? t.defaultTone : "warm";
  const gen: MessageGen = {
    templateTitle: t.title,
    templateBase: t.baseText,
    situation: t.situation,
    apiTone,
    systemPrompt: t.systemPrompt,
    fallback: t.baseText || "Hola, qué gusto saludarte. ¿Cómo has estado?",
  };

  return <MensajeResultadoScreen gen={gen} />;
}
