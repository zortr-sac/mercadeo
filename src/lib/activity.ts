import "server-only";
import { getRepositories } from "@/data";
import type { ActivityKind } from "@/data/types";

/**
 * Registra una actividad (gamificación por esfuerzo, NO por resultados).
 * Nunca debe bloquear la acción principal: si falla, se ignora en silencio.
 */
export async function logActivity(
  userId: string,
  businessId: string | null,
  kind: ActivityKind,
): Promise<void> {
  try {
    await getRepositories().activity.log({ userId, businessId, kind });
  } catch {
    // El log de actividad es secundario; no rompe el flujo.
  }
}
