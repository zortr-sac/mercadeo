import type { Metadata } from "next";
import { DownloadsScreen } from "@/features/offline/downloads-screen";

export const metadata: Metadata = { title: "Descargados" };

export default function DescargadosPage() {
  return <DownloadsScreen />;
}
