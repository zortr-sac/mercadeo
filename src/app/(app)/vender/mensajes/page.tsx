import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { MensajesScreen, type TemplateItem } from "@/features/vender/mensajes-screen";

export const metadata: Metadata = { title: "Escribir un mensaje" };

export default async function MensajesPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const templates = await getRepositories().duplication.listMessageTemplates({ businessId });
  const items: TemplateItem[] = templates.map((t) => ({
    id: t.id,
    title: t.title,
    situation: t.situation,
  }));
  return <MensajesScreen templates={items} />;
}
