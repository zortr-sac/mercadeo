/**
 * Racha de días consecutivos con actividad, calculada en la zona horaria LOCAL
 * del dispositivo del usuario. La app es multipaís (Perú, Bolivia, Colombia,
 * Chile…), cada uno con su horario (y Chile con horario de verano), así que el
 * "día" se define por la hora local del cliente, NO por una zona fija ni por UTC.
 *
 * Se computa en el cliente porque solo el navegador conoce la zona real del
 * dispositivo. Los getters locales de `Date` (getFullYear/getMonth/getDate)
 * aplican la TZ del dispositivo y respetan el DST automáticamente.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Días consecutivos con actividad hasta hoy (o ayer, periodo de gracia para no
 * romper la racha hasta perder un día completo). `isoDates` son los `created_at`
 * (UTC) de los eventos de actividad; se agrupan por día LOCAL.
 */
export function computeStreakLocal(isoDates: string[], now: Date = new Date()): number {
  if (!isoDates.length) return 0;
  const days = new Set(isoDates.map((iso) => localDayKey(new Date(iso))));
  const todayKey = localDayKey(now);
  const yesterdayKey = localDayKey(new Date(now.getTime() - ONE_DAY_MS));

  let cursor: Date;
  if (days.has(todayKey)) cursor = new Date(now);
  else if (days.has(yesterdayKey)) cursor = new Date(now.getTime() - ONE_DAY_MS);
  else return 0;

  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }
  return streak;
}
