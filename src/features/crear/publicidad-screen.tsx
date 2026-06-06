"use client";
// Pantalla 12 — Anuncio / Flyer con IA. Ported 1:1 from prototipo/screens-crear.jsx;
// the simulated generation is replaced by the real /api/ai/flyer (Nano Banana) + native share.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, TextArea, Btn, SectionLabel, AIWorking, Toast, useToast } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { shareOrDownloadImage } from "./share";
import { useAiLimitStore } from "@/store/ai-limit-store";

const AD_CHIPS = ["Oferta", "Producto nuevo", "Testimonio"];
const SHARE: { name: IconName; label: string; bg: string; border?: boolean; isDownload?: boolean }[] = [
  { name: "whatsapp", label: "WhatsApp", bg: "#25D366" },
  { name: "instagram", label: "Instagram", bg: "#fff", border: true },
  { name: "tiktok", label: "TikTok", bg: "#fff", border: true },
  { name: "download", label: "Descargar", bg: "var(--blue)", isDownload: true },
];
type State = "idle" | "loading" | "done";

export function PublicidadScreen() {
  const router = useRouter();
  const [chip, setChip] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [mime, setMime] = useState("image/png");
  const [msg, flash] = useToast();

  const run = async () => {
    if (text.trim().length < 3) return;
    setState("loading");
    try {
      const res = await fetch("/api/ai/flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), description: text.trim(), kind: chip || undefined }),
      });
      if (res.status === 429) {
        useAiLimitStore.getState().show();
        setState("idle");
        return;
      }
      const data = await res.json();
      if (data.status === "ok" && data.image) {
        setImage(`data:${data.mimeType};base64,${data.image}`);
        setMime(typeof data.mimeType === "string" ? data.mimeType : "image/png");
        setState("done");
      } else {
        flash(data.message || "No se pudo crear. Intenta de nuevo.");
        setState("idle");
      }
    } catch {
      flash("No se pudo crear. Intenta de nuevo.");
      setState("idle");
    }
  };
  const reset = () => {
    setState("idle");
    setImage(null);
  };
  const onShare = async () => {
    if (!image) return;
    const r = await shareOrDownloadImage(image, mime, "anuncio");
    flash(r === "shared" ? "Abriendo para compartir…" : "Guardado en tu dispositivo");
  };

  return (
    <>
      <TopBarSub title="Hacer un Anuncio" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {AD_CHIPS.map((c) => (
            <button key={c} className="ns-press" onClick={() => setChip(c)} style={{
              flex: 1, minHeight: 48, borderRadius: 999, fontSize: 16, fontWeight: 600,
              background: chip === c ? "var(--blue)" : "var(--surface)",
              color: chip === c ? "#fff" : "var(--text-2)",
              border: chip === c ? "none" : "1.5px solid var(--border)",
            }}>{c}</button>
          ))}
        </div>
        <h2 style={{ fontSize: 22 }}>¿Qué quieres anunciar?</h2>
        <TextArea value={text} onChange={setText} minHeight={90}
          placeholder="Ejemplo: crema facial con descuento esta semana" />
        <Btn size="xl" icon="sparkles" onClick={run}>Crear anuncio</Btn>

        {state === "loading" && <AIWorking label="Diseñando tu anuncio…" />}

        {state === "done" && image && (
          <div className="ns-rise" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Anuncio generado" style={{ width: "100%", borderRadius: 18, display: "block" }} />
              <span style={{
                position: "absolute", top: 12, right: 12, background: "rgba(15,23,42,.78)", color: "#fff",
                fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5,
              }}>
                <Icon name="sparkles" size={14} color="#fff" /> Hecho con IA
              </span>
            </div>
            <SectionLabel>Compártelo ahora</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {SHARE.map((s) => (
                <button key={s.name} className="ns-press" onClick={onShare} style={{
                  minHeight: 64, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontSize: 17, fontWeight: 600,
                  background: s.bg, color: s.isDownload ? "#fff" : s.border ? "var(--text)" : "#fff",
                  border: s.border ? "1.5px solid var(--border)" : "none",
                }}>
                  {s.isDownload ? <Icon name="download" size={22} color="#fff" /> : <Icon name={s.name} size={26} />}
                  {s.label}
                </button>
              ))}
            </div>
            <button className="ns-press" onClick={reset} style={{
              color: "var(--blue)", fontSize: 18, fontWeight: 600, padding: 8, alignSelf: "center", background: "none", border: "none",
            }}>
              Crear otro
            </button>
          </div>
        )}
      </div>
      <Toast show={!!msg} icon="check">{msg}</Toast>
    </>
  );
}
