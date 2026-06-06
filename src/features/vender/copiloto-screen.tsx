"use client";
// Pantalla 16 — Copiloto de conversación. Ported 1:1 from prototipo/screens-vender.jsx;
// the mock replies are replaced by the real /api/ai/conversation (Gemini vision).
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, IconCircle, Note, SectionLabel, Card, Btn, AIWorking, Toast, useToast } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { useAiLimitStore } from "@/store/ai-limit-store";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}

export function CopilotoScreen({ prospectId, name }: { prospectId: string; name: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [reading, setReading] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [msg, flash] = useToast();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setState("loading");
    try {
      const base64 = await fileToDataUrl(file);
      const res = await fetch("/api/ai/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), prospectId, imageBase64: base64 }),
      });
      if (res.status === 429) {
        useAiLimitStore.getState().show();
        setState("idle");
        return;
      }
      const data = await res.json();
      if (res.ok && Array.isArray(data.suggestions) && data.suggestions.length) {
        setReading(typeof data.reading === "string" ? data.reading : "");
        setSuggestions(
          data.suggestions
            .map((s: unknown) => (typeof s === "string" ? s : (s as { text?: string }).text ?? ""))
            .filter(Boolean),
        );
        setState("done");
      } else {
        flash(data.error || "No se pudo analizar. Intenta de nuevo.");
        setState("idle");
      }
    } catch {
      flash("No se pudo analizar. Intenta de nuevo.");
      setState("idle");
    }
  };

  const onUse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash("Respuesta copiada");
    } catch {
      flash("Lista para enviar");
    }
  };

  return (
    <>
      <TopBarSub title={name} onBack={() => router.back()} />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button className="ns-press" onClick={() => fileRef.current?.click()} style={{
          width: "100%", minHeight: 140, borderRadius: 18, border: "2.5px dashed var(--border-strong)",
          background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 20,
        }}>
          <IconCircle icon="upload" tone="blue" size={56} />
          <span style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Subir captura de WhatsApp</span>
          <span style={{ fontSize: 16, color: "var(--text-2)" }}>Toma o elige una foto del chat</span>
        </button>

        {state === "loading" && <AIWorking label="Leyendo la conversación…" />}

        {state === "done" && (
          <div className="ns-rise" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Note tone="blue" icon="chat">
              <strong style={{ fontWeight: 600 }}>Lo que entendí:</strong> {reading}
            </Note>
            <SectionLabel>Respuestas sugeridas</SectionLabel>
            {suggestions.map((r, i) => (
              <Card key={i} pad={16} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 999, background: "var(--blue-soft)", color: "var(--blue)",
                    display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16, flexShrink: 0,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 18, lineHeight: 1.5, flex: 1 }}>{r}</p>
                </div>
                <Btn size="md" icon="send" onClick={() => onUse(r)}>Usar esta</Btn>
              </Card>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 16, fontWeight: 600, justifyContent: "center" }}>
              <Icon name="shield" size={22} color="var(--green)" /> Todas son seguras y amables
            </div>
          </div>
        )}
      </div>
      <Toast show={!!msg}>{msg}</Toast>
    </>
  );
}
