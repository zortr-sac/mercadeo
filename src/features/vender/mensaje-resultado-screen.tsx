"use client";
// Pantalla 14 — Resultado del mensaje. Genera con /api/ai/message usando el system
// prompt del mensaje del negocio; si la IA falla, usa el "mensaje de ejemplo".
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, Btn, AIWorking, Toast, useToast } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import type { MessageTone } from "@/data/types";
import { useAiLimitStore } from "@/store/ai-limit-store";

export interface MessageGen {
  templateTitle: string;
  templateBase: string;
  situation: string;
  apiTone: MessageTone;
  systemPrompt: string;
  fallback: string;
}

export function MensajeResultadoScreen({ gen }: { gen: MessageGen }) {
  const router = useRouter();
  const [msg, flash] = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/ai/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            prospectName: "Hola",
            prospectContext: "",
            templateTitle: gen.templateTitle,
            templateBase: gen.templateBase,
            situation: gen.situation,
            complianceHint: "",
            tone: gen.apiTone,
            userInstruction: "",
            systemPrompt: gen.systemPrompt,
          }),
        });
        if (res.status === 429) {
          useAiLimitStore.getState().show();
          setMessage(gen.fallback);
          return;
        }
        const data = await res.json();
        setMessage(typeof data.message === "string" && data.message ? data.message : gen.fallback);
      } catch {
        setMessage(gen.fallback);
      }
    })();
  }, [gen]);

  const sendWhatsApp = () => {
    if (!message) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };
  const copy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      flash("Mensaje copiado");
    } catch {
      flash("Cópialo manualmente");
    }
  };

  return (
    <>
      <TopBarSub title="Tu mensaje" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>Para: contacto nuevo</p>
        {!message ? (
          <AIWorking label="Escribiendo tu mensaje…" />
        ) : (
          <>
            <div style={{
              background: "var(--blue-soft)", border: "1px solid var(--blue-tint)", borderRadius: 18,
              borderBottomLeftRadius: 6, padding: 20, fontSize: 19, lineHeight: 1.55, color: "var(--text)",
            }}>
              {message}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 16, fontWeight: 600 }}>
              <Icon name="shield" size={22} color="var(--green)" /> Mensaje seguro y amable
            </div>
            <Btn size="xl" variant="success" icon="whatsapp" onClick={sendWhatsApp}>Enviar por WhatsApp</Btn>
            <Btn size="md" variant="outline" icon="copy" onClick={copy}>Copiar</Btn>
            <button className="ns-press" onClick={() => router.back()} style={{
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              color: "var(--blue)", fontSize: 18, fontWeight: 600, padding: 8, background: "none", border: "none",
            }}>
              <Icon name="refresh" size={20} color="var(--blue)" /> Escribir otro
            </button>
          </>
        )}
      </div>
      <Toast show={!!msg}>{msg}</Toast>
    </>
  );
}
