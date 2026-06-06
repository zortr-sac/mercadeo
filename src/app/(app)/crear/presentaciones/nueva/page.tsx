import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { PresentacionNuevaScreen } from "@/features/crear/presentacion-nueva-screen";

export const metadata: Metadata = { title: "Nueva presentación" };

export default async function PresentacionNuevaPage() {
  await requireSession();
  return <PresentacionNuevaScreen />;
}
