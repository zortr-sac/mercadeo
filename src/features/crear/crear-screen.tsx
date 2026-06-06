"use client";
// Pantalla 9 — Crear (hub). Ported 1:1 from prototipo/screens-crear.jsx.
import { useRouter } from "next/navigation";
import { TopBarMain, BigChoice } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";

export function CrearScreen() {
  const router = useRouter();
  return (
    <>
      <TopBarMain title="Crear" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>La inteligencia artificial lo hace por ti.</p>
        <BigChoice icon="slides" tone="blue" title="Hacer una Presentación"
          desc="Para mostrar tu producto con láminas bonitas." onClick={() => router.push(`${ROUTES.crear}/presentaciones`)} />
        <BigChoice icon="megaphone" tone="orange" title="Hacer un Anuncio"
          desc="Crea una imagen para compartir en redes." onClick={() => router.push(`${ROUTES.crear}/publicidad`)} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 4,
          color: "var(--text-2)", fontSize: 16,
        }}>
          <Icon name="sparkles" size={20} color="var(--orange)" />
          Tú escribes una idea, la IA hace el diseño.
        </div>
      </div>
    </>
  );
}
