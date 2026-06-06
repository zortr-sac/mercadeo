"use client";
// Vender hub. Ported 1:1 from prototipo/screens-entry.jsx (VenderHub).
import { useRouter } from "next/navigation";
import { TopBarMain, BigChoice } from "@/components/netscale/ui";
import { ROUTES } from "@/lib/constants";

export function VenderHubScreen() {
  const router = useRouter();
  return (
    <>
      <TopBarMain title="Vender" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>La IA te ayuda a hablar con tus contactos.</p>
        <BigChoice icon="chat" tone="blue" title="Escribir un mensaje"
          desc="La IA escribe por ti, sin presionar." onClick={() => router.push(`${ROUTES.vender}/mensajes`)} />
        <BigChoice icon="users" tone="orange" title="Mis contactos"
          desc="Tu lista de personas, ordenada y simple." onClick={() => router.push(`${ROUTES.vender}/prospectos`)} />
      </div>
    </>
  );
}
