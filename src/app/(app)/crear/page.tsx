import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { CrearScreen } from "@/features/crear/crear-screen";

export const metadata: Metadata = { title: "Crear" };

export default async function CrearPage() {
  await requireSession();
  return <CrearScreen />;
}
