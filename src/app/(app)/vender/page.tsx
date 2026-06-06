import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { VenderHubScreen } from "@/features/vender/vender-hub-screen";

export const metadata: Metadata = { title: "Vender" };

export default async function VenderPage() {
  await requireSession();
  return <VenderHubScreen />;
}
