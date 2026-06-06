"use client";
// Pantalla 18 — Mi progreso. Gamificación por actividad (NO por resultados).
// La racha se calcula en la zona horaria LOCAL del dispositivo (app multipaís).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, Card, IconCircle } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { computeStreakLocal } from "@/lib/streak";

type Earned = { primerContacto: boolean; cincoVideos: boolean };

export function ProgresoScreen({
  streakDaysServer,
  eventDates,
  earned,
}: {
  streakDaysServer: number;
  eventDates: string[];
  earned: Earned;
}) {
  const router = useRouter();

  // Racha recalculada con la zona horaria local del dispositivo. Empieza con el
  // valor del servidor (evita parpadeo/hydration mismatch) y se ajusta tras montar.
  const [streakDays, setStreakDays] = useState(streakDaysServer);
  useEffect(() => {
    const id = requestAnimationFrame(() => setStreakDays(computeStreakLocal(eventDates)));
    return () => cancelAnimationFrame(id);
  }, [eventDates]);

  const semana = streakDays >= 7;
  const achievements: { icon: IconName; label: string; earned: boolean; tone: Tone }[] = [
    { icon: "wave", label: "Primer contacto", earned: earned.primerContacto, tone: "orange" },
    { icon: "playLine", label: "5 videos", earned: earned.cincoVideos, tone: "blue" },
    { icon: "flame", label: "1 semana", earned: semana, tone: semana ? "orange" : "gray" },
  ];

  return (
    <>
      <TopBarSub title="Mi progreso" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* streak hero */}
        <div style={{
          borderRadius: 22, padding: 22, color: "#fff", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, var(--blue) 0%, #3B82F6 60%, #60A5FA 100%)",
          boxShadow: "0 10px 26px rgba(29,78,216,.3)",
        }}>
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.25 }}>
            <Icon name="flame" size={130} color="#fff" />
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="flame" size={26} color="#fff" />
              <span style={{ fontSize: 17, fontWeight: 600, opacity: 0.92 }}>Tu racha</span>
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 68, lineHeight: 1, marginTop: 6 }}>
              {streakDays}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>
              {streakDays > 0 ? "días seguidos. ¡Muy bien!" : "¡Empieza tu racha hoy!"}
            </div>
          </div>
        </div>

        {/* achievements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {achievements.map((a) => (
            <Card key={a.label} pad={12} dim={!a.earned}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
              <IconCircle icon={a.earned ? a.icon : "lock"} tone={a.tone} size={52} />
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: a.earned ? "var(--text)" : "var(--locked)" }}>
                {a.label}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
