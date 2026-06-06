"use client";
// Visor de una presentación: muestra cada diapositiva (imagen) con navegación
// anterior/siguiente, tira de miniaturas, descarga del archivo y corazón.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, Note } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { HeartButton } from "@/features/reactions/heart-button";
import { formatBytes } from "@/lib/media";
import type { PresentationTemplate } from "@/data/types";

function fileLabel(name: string | null): string {
  if (!name || !name.includes(".")) return "archivo";
  return name.split(".").pop()!.toUpperCase();
}

export function PresentationViewer({
  template,
  reacted,
}: {
  template: PresentationTemplate;
  reacted: boolean;
}) {
  const router = useRouter();
  const slides = template.slides ?? [];
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, total - 1));
  const current = total > 0 ? slides[safeIndex] : null;

  useEffect(() => {
    if (total === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((v) => Math.min(total - 1, v + 1));
      if (e.key === "ArrowLeft") setIndex((v) => Math.max(0, v - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <>
      <TopBarSub title={template.title} onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {current ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.url}
              src={current.url}
              alt={`Diapositiva ${safeIndex + 1}`}
              className="ns-rise"
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "contain",
                background: "#0B1220",
                borderRadius: 16,
                display: "block",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <NavBtn
                dir="prev"
                disabled={safeIndex === 0}
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
              />
              <span style={{ fontWeight: 600, fontSize: 17, color: "var(--text-2)" }}>
                {safeIndex + 1} / {total}
              </span>
              <NavBtn
                dir="next"
                disabled={safeIndex >= total - 1}
                onClick={() => setIndex((v) => Math.min(total - 1, v + 1))}
              />
            </div>

            {total > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {slides.map((s, i) => {
                  const on = i === safeIndex;
                  return (
                    <button
                      key={s.url + i}
                      onClick={() => setIndex(i)}
                      className="ns-press"
                      aria-label={`Ir a la diapositiva ${i + 1}`}
                      style={{
                        flexShrink: 0,
                        width: 84,
                        aspectRatio: "16 / 9",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: on ? "2.5px solid var(--blue)" : "1.5px solid var(--border-strong)",
                        padding: 0,
                        background: "#0B1220",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Note tone="blue" icon="slides">
            Esta presentación no tiene diapositivas para ver aquí. Puedes descargar el archivo
            completo abajo.
          </Note>
        )}

        {template.description && (
          <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.5 }}>
            {template.description}
          </p>
        )}

        {template.fileUrl && (
          <a
            href={template.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="ns-press"
            style={{
              width: "100%",
              height: 60,
              borderRadius: "var(--r-btn)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "var(--blue)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 19,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(29,78,216,.28)",
            }}
          >
            <Icon name="download" size={24} color="#fff" strokeWidth={2.2} />
            Descargar {fileLabel(template.fileName)}
            {template.fileBytes ? ` · ${formatBytes(template.fileBytes)}` : ""}
          </a>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, color: "var(--text-2)" }}>¿Te gustó esta presentación?</span>
          <div style={{ marginLeft: "auto" }}>
            <HeartButton type="presentation" contentId={template.id} initialReacted={reacted} />
          </div>
        </div>
      </div>
    </>
  );
}

function NavBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
      className="ns-press"
      style={{
        width: 56,
        height: 56,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: disabled ? "var(--locked-soft)" : "var(--blue-soft)",
        border: "none",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon
        name={dir === "prev" ? "chevL" : "chevR"}
        size={28}
        color={disabled ? "var(--locked)" : "var(--blue)"}
        strokeWidth={2.6}
      />
    </button>
  );
}
