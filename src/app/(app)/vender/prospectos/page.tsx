import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { ProspectosScreen, type ProspectItem } from "@/features/vender/prospectos-screen";

export const metadata: Metadata = { title: "Mis contactos" };

export default async function ProspectosPage() {
  const user = await requireSession();
  const prospects = await getRepositories().prospects.listByOwner(user.id);
  const items: ProspectItem[] = prospects.map((p) => ({ id: p.id, name: p.name, stage: p.stage }));
  return <ProspectosScreen prospects={items} />;
}
