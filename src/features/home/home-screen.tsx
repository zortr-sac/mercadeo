"use client";
// Pantalla 3 — Inicio (variante "guía"). Ported 1:1 from prototipo/screens-home.jsx.
import { useRouter } from "next/navigation";
import { TopBarMain, Card, IconCircle, Btn, SectionLabel } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import type { IconName } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";

const SHORTCUTS: { icon: IconName; tone: Tone; label: string; href: string }[] = [
  { icon: "cap", tone: "blue", label: "Aprender", href: ROUTES.academia },
  { icon: "sparkles", tone: "orange", label: "Crear", href: ROUTES.crear },
  { icon: "chat", tone: "blue", label: "Vender", href: ROUTES.vender },
  { icon: "trophy", tone: "orange", label: "Mi progreso", href: ROUTES.progreso },
];

export function HomeScreen({ firstName, avatar }: { firstName: string; avatar: string }) {
  const router = useRouter();
  return (
    <>
      <TopBarMain avatar={avatar} onAvatar={() => router.push(ROUTES.perfil)} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Hola, {firstName}</h1>
        </div>

        {/* Tu enfoque de hoy */}
        <Card pad={20} style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #FFF6EE 100%)", border: "1px solid #FBE2CC",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <IconCircle icon="bulb" tone="orange" size={48} />
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 18, color: "var(--orange)" }}>
              Tu enfoque de hoy
            </span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.35, marginBottom: 16 }}>
            Escríbele a un contacto nuevo hoy
          </p>
          <Btn size="md" iconRight="chevR" onClick={() => router.push(`${ROUTES.vender}/mensajes`)}>Empezar</Btn>
        </Card>

        {/* ¿Qué quieres hacer? */}
        <div>
          <SectionLabel style={{ marginBottom: 14 }}>¿Qué quieres hacer?</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {SHORTCUTS.map((s) => (
              <Card key={s.label} onClick={() => router.push(s.href)} pad={18}
                style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 150, justifyContent: "center" }}>
                <IconCircle icon={s.icon} tone={s.tone} size={60} />
                <span style={{ fontSize: 20, fontWeight: 600 }}>{s.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
