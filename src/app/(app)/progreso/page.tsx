import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { ProgresoScreen } from "@/features/constancia/progreso-screen";

export const metadata: Metadata = { title: "Mi progreso" };

export default async function ProgresoPage() {
  const user = await requireSession();
  const stats = await getRepositories().activity.getStats(user.id);
  const k = stats.byKind;
  const earned = {
    primerContacto: (k.prospect_added || 0) + (k.conversation_used || 0) >= 1,
    cincoVideos: (k.lesson_completed || 0) >= 5,
    semana: stats.streakDays >= 7,
  };
  return <ProgresoScreen streakDays={stats.streakDays} earned={earned} />;
}
