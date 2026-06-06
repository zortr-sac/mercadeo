"use client";
// Pantalla 10 — Presentaciones. Lista las plantillas (PPT/PDF) que el admin del
// negocio subió; vacío si no hay. El botón "Crear una nueva con IA" sigue activo.
import { useRouter } from "next/navigation";
import { TopBarSub, Btn, SectionLabel, Card, ImagePlaceholder, Note } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import { formatBytes } from "@/lib/media";
import type { PresentationTemplate } from "@/data/types";

function fileLabel(name: string | null): string {
  if (!name || !name.includes(".")) return "archivo";
  return name.split(".").pop()!.toUpperCase();
}

export function PresentacionesScreen({ templates }: { templates: PresentationTemplate[] }) {
  const router = useRouter();
  const ready = templates.filter((t) => t.fileUrl);

  return (
    <>
      <TopBarSub title="Presentaciones" onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Btn
          size="xl"
          icon="sparkles"
          onClick={() => router.push(`${ROUTES.crear}/presentaciones/nueva`)}
        >
          Crear una nueva con IA
        </Btn>

        {ready.length > 0 && (
          <SectionLabel style={{ marginTop: 4 }}>O usa una plantilla lista</SectionLabel>
        )}

        {ready.length === 0 ? (
          <Note tone="blue" icon="slides">
            Tu negocio aún no tiene plantillas. Por ahora puedes crear una nueva con la
            inteligencia artificial.
          </Note>
        ) : (
          ready.map((t) => (
            <Card key={t.id} pad={14} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 96, flexShrink: 0 }}>
                {t.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.coverUrl}
                    alt=""
                    style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, display: "block" }}
                  />
                ) : (
                  <ImagePlaceholder theme="slide" icon="slides" aspect="4/3" radius={12} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 18 }}>{t.title}</h3>
                {t.description && (
                  <p style={{ fontSize: 15, color: "var(--text-2)", marginTop: 4, lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                )}
                <a
                  href={t.fileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ns-press"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                    textDecoration: "none", color: "var(--blue)", fontWeight: 600, fontSize: 17,
                  }}
                >
                  <Icon name="download" size={20} color="var(--blue)" />
                  Descargar {fileLabel(t.fileName)}
                  {t.fileBytes ? ` · ${formatBytes(t.fileBytes)}` : ""}
                </a>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
