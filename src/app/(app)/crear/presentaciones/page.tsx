import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { PresentacionesScreen } from "@/features/crear/presentaciones-screen";

export const metadata: Metadata = { title: "Presentaciones" };

export default async function PresentacionesPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const templates = await getRepositories().presentationTemplates.list({ businessId });
  return <PresentacionesScreen templates={templates} />;
}
