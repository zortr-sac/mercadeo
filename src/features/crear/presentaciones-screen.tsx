"use client";
// Pantalla 10 — Presentaciones (plantillas). Ported 1:1 from
// prototipo/screens-crear.jsx; templates download a real PDF via jspdf.
import { useRouter } from "next/navigation";
import { TopBarSub, Btn, SectionLabel, Card, ImagePlaceholder, Chip, Toast, useToast } from "@/components/netscale/ui";
import type { PhTheme } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import { downloadPresentationPdf, type Slide } from "./pdf";

const TEMPLATES: { title: string; tag: string; theme: PhTheme; slides: Slide[] }[] = [
  {
    title: "Presenta el producto", tag: "5 láminas", theme: "slide", slides: [
      { title: "Hola, te quiero mostrar algo", bullets: ["Información clara y sin compromiso.", "A tu ritmo, con calma."] },
      { title: "¿Qué es?", bullets: ["Un producto de bienestar.", "Fácil de usar en el día a día."] },
      { title: "¿Para quién es?", bullets: ["Para personas que quieren sentirse mejor.", "Para ti y para quienes quieres."] },
      { title: "¿Cómo se usa?", bullets: ["Paso 1", "Paso 2", "Paso 3"] },
      { title: "¿Te gustaría saber más?", bullets: ["Con gusto te explico cuando quieras."] },
    ],
  },
  {
    title: "Cuenta tu historia", tag: "4 láminas", theme: "cover", slides: [
      { title: "Mi historia", bullets: ["Cómo empecé.", "Por qué me gusta esto."] },
      { title: "Lo que cambió", bullets: ["Lo que aprendí.", "Cómo me sentí."] },
      { title: "Lo que ofrezco", bullets: ["Productos en los que confío.", "Acompañamiento con calma."] },
      { title: "Hablemos", bullets: ["Escríbeme cuando quieras, sin compromiso."] },
    ],
  },
  {
    title: "Invita a una reunión", tag: "3 láminas", theme: "people", slides: [
      { title: "Te invito", bullets: ["Una reunión sencilla y cercana.", "Sin compromiso."] },
      { title: "¿De qué hablaremos?", bullets: ["Productos de bienestar.", "Cómo aprovecharlos."] },
      { title: "¿Cuándo?", bullets: ["Día y hora.", "Te espero con gusto."] },
    ],
  },
];

export function PresentacionesScreen() {
  const router = useRouter();
  const [msg, flash] = useToast();
  const download = (t: (typeof TEMPLATES)[number]) => {
    downloadPresentationPdf(t.title, t.slides);
    flash(`Descargando «${t.title}»`);
  };
  return (
    <>
      <TopBarSub title="Presentaciones" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Btn size="xl" icon="sparkles" onClick={() => router.push(`${ROUTES.crear}/presentaciones/nueva`)}>Crear una nueva con IA</Btn>
        <SectionLabel style={{ marginTop: 4 }}>O usa una plantilla lista</SectionLabel>
        {TEMPLATES.map((t, i) => (
          <Card key={i} pad={14} style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 96, flexShrink: 0 }}>
              <ImagePlaceholder theme={t.theme} icon="slides" aspect="4/3" radius={12} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 18 }}>{t.title}</h3>
              <div style={{ marginTop: 6 }}><Chip tone="blue">{t.tag}</Chip></div>
              <button className="ns-press" onClick={() => download(t)} style={{
                display: "flex", alignItems: "center", gap: 6, marginTop: 10,
                color: "var(--blue)", fontWeight: 600, fontSize: 17, background: "none", border: "none",
              }}>
                <Icon name="download" size={20} color="var(--blue)" />Descargar
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Toast show={!!msg} icon="download">{msg}</Toast>
    </>
  );
}
