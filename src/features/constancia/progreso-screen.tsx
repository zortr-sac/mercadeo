"use client";
// Pantalla 18 — Mi progreso. Ported 1:1 from prototipo/screens-perfil.jsx,
// wired to real gamification stats + the /api/ai/reframe coach.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, Card, IconCircle, Btn, TextArea } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { saveLearningAction } from "./actions";
import { useAiLimitStore } from "@/store/ai-limit-store";

type Earned = { primerContacto: boolean; cincoVideos: boolean; semana: boolean };

const FALLBACK_REFRAME =
  "Un “no” no habla de ti, habla de un momento. Cada conversación te hace mejor y más cercano a la persona correcta. Estás siendo constante, y eso es lo que cuenta. ¡Sigue así!";

export function ProgresoScreen({ streakDays, earned }: { streakDays: number; earned: Earned }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [reframe, setReframe] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const achievements: { icon: IconName; label: string; earned: boolean; tone: Tone }[] = [
    { icon: "wave", label: "Primer contacto", earned: earned.primerContacto, tone: "orange" },
    { icon: "playLine", label: "5 videos", earned: earned.cincoVideos, tone: "blue" },
    { icon: "flame", label: "1 semana", earned: earned.semana, tone: earned.semana ? "orange" : "gray" },
  ];

  const recibirAnimo = () => {
    const situation = text.trim();
    if (situation.length < 3) return;
    start(async () => {
      let reframeText = FALLBACK_REFRAME;
      try {
        const res = await fetch("/api/ai/reframe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), situation }),
        });
        if (res.status === 429) {
          useAiLimitStore.getState().show();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data?.reframe) reframeText = data.reframe;
        }
      } catch {
        // keep fallback
      }
      setReframe(reframeText);
      try {
        await saveLearningAction({ situation, reframe: reframeText });
      } catch {
        // gamification logging never blocks the user
      }
    });
  };

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

        {/* ánimo de hoy */}
        <Card pad={18} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconCircle icon="heart" tone="orange" size={46} />
            <h3 style={{ fontSize: 20 }}>Tu ánimo de hoy</h3>
          </div>
          <p style={{ fontSize: 18, color: "var(--text-2)" }}>¿Te dijeron que no? Cuéntame.</p>
          <TextArea value={text} onChange={setText} minHeight={80} placeholder="Escribe lo que pasó…" />
          <Btn size="md" icon="heart" onClick={recibirAnimo}>{pending ? "Pensando…" : "Recibir ánimo"}</Btn>
          {reframe && (
            <div className="ns-rise" style={{
              background: "var(--orange-soft)", border: "1px solid #FBE2CC",
              borderRadius: 14, padding: 16, fontSize: 18, lineHeight: 1.5, color: "var(--text)",
            }}>
              {reframe}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
