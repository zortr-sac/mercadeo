import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { ProgresoScreen } from "@/features/constancia/progreso-screen";

export const metadata: Metadata = { title: "Mi progreso" };

export default async function ProgresoPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const [stats, recent] = await Promise.all([
    repos.activity.getStats(user.id),
    repos.activity.listRecent(user.id, 400),
  ]);
  const k = stats.byKind;
  // La racha se recalcula en el cliente con la zona horaria LOCAL del usuario
  // (app multipaís). Aquí pasamos las fechas de actividad y un valor inicial
  // del servidor para el primer render.
  return (
    <ProgresoScreen
      streakDaysServer={stats.streakDays}
      eventDates={recent.map((e) => e.createdAt)}
      earned={{
        primerContacto: (k.prospect_added || 0) + (k.conversation_used || 0) >= 1,
        cincoVideos: (k.lesson_completed || 0) >= 5,
      }}
    />
  );
}
