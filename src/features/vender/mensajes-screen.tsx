"use client";
// Pantalla 13 — Mensajes: lista los mensajes del negocio (los crea el admin). Cada
// tarjeta abre el resultado, donde la IA redacta según el system prompt del mensaje.
import { useRouter } from "next/navigation";
import { TopBarSub, Card, IconCircle } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";

export interface TemplateItem {
  id: string;
  title: string;
  situation: string;
}

export function MensajesScreen({ templates }: { templates: TemplateItem[] }) {
  const router = useRouter();
  return (
    <>
      <TopBarSub title="Escribir un mensaje" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>Elige un mensaje y la IA lo escribe por ti.</p>
        {templates.length === 0 ? (
          <Card pad={20} style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 18 }}>Aún no hay mensajes</h3>
            <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 6 }}>
              Tu equipo agregará mensajes muy pronto.
            </p>
          </Card>
        ) : (
          templates.map((t) => (
            <Card key={t.id} onClick={() => router.push(`${ROUTES.vender}/mensajes/resultado?template=${t.id}`)} pad={16}
              style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 88 }}>
              <IconCircle icon="chat" tone="orange" size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 20, lineHeight: 1.2 }}>{t.title}</h3>
                {t.situation && <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 3 }}>{t.situation}</p>}
              </div>
              <Icon name="chevR" size={24} color="var(--blue)" strokeWidth={2.4} />
            </Card>
          ))
        )}
      </div>
    </>
  );
}
