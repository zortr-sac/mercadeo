"use client";
// Pantalla 11 — Presentación con IA. Ported 1:1 from prototipo/screens-crear.jsx;
// the simulated generation is replaced by the real /api/ai/presentation call + PDF.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, TextArea, Btn, SectionLabel, ImagePlaceholder, AIWorking } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { downloadPresentationPdf, sharePresentationPdf, type Slide } from "./pdf";
import { ImageAttachField } from "./image-attach-field";
import type { PreparedImage } from "@/features/duplication/image-utils";
import { useAiLimitStore } from "@/store/ai-limit-store";

type State = "idle" | "loading" | "done";

export function PresentacionNuevaScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [refImage, setRefImage] = useState<PreparedImage | null>(null);

  const run = async () => {
    if (text.trim().length < 3) return;
    setState("loading");
    try {
      const res = await fetch("/api/ai/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          topic: text.trim(),
          ...(refImage ? { imageBase64: refImage.dataUrl, imageMimeType: refImage.mimeType } : {}),
        }),
      });
      if (res.status === 429) {
        useAiLimitStore.getState().show();
        setState("idle");
        return;
      }
      const data = await res.json();
      setTitle(typeof data.title === "string" ? data.title : text.trim());
      setSlides(Array.isArray(data.slides) ? data.slides : []);
    } catch {
      setTitle(text.trim());
      setSlides([]);
    }
    setState("done");
  };
  const reset = () => {
    setState("idle");
    setSlides([]);
    setTitle("");
  };

  return (
    <>
      <TopBarSub title="Nueva presentación" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 22 }}>¿De qué quieres hablar?</h2>
        <TextArea value={text} onChange={setText} minHeight={110}
          placeholder="Ejemplo: los beneficios del programa de control de peso" />
        <ImageAttachField
          value={refImage}
          onChange={setRefImage}
          label="Agregar imagen de contexto (opcional)"
          hint="La IA considerará la imagen para armar las diapositivas."
        />
        <Btn size="xl" icon="sparkles" onClick={run}>Crear con IA</Btn>

        {state === "loading" && <AIWorking label="Creando tus láminas…" />}

        {state === "done" && (
          <div className="ns-rise" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: "var(--green)", display: "grid", placeItems: "center" }}>
                <Icon name="check" size={18} color="#fff" strokeWidth={3} />
              </span>
              <SectionLabel>Tu presentación está lista</SectionLabel>
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {slides.map((s, i) => (
                <div key={i} style={{ width: 116, flexShrink: 0 }}>
                  <ImagePlaceholder theme={i % 2 ? "slide" : "people"} icon="slides" aspect="3/4" radius={12} label={`Lámina ${i + 1}`} />
                </div>
              ))}
            </div>
            <Btn size="lg" variant="success" icon="download" onClick={() => downloadPresentationPdf(title, slides)}>Descargar</Btn>
            <Btn size="md" variant="outline" icon="share" onClick={() => void sharePresentationPdf(title, slides)}>Compartir</Btn>
            <button className="ns-press" onClick={reset} style={{
              color: "var(--blue)", fontSize: 18, fontWeight: 600, padding: 8, alignSelf: "center", background: "none", border: "none",
            }}>
              Volver a intentar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
