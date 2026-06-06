import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { PresentacionesScreen } from "@/features/crear/presentaciones-screen";

export const metadata: Metadata = { title: "Presentaciones" };

export default async function PresentacionesPage() {
  await requireSession();
  return <PresentacionesScreen />;
}
