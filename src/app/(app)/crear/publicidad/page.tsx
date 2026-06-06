import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { PublicidadScreen } from "@/features/crear/publicidad-screen";

export const metadata: Metadata = { title: "Hacer un Anuncio" };

export default async function PublicidadPage() {
  await requireSession();
  return <PublicidadScreen />;
}
