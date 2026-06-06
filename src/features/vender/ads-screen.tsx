"use client";
// Pestaña "Vender": galería de anuncios que el admin subió. El cliente copia el
// texto, descarga la imagen o comparte por WhatsApp/TikTok/Instagram/Facebook, y
// puede marcar su anuncio favorito con un corazón.
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TopBarMain, Card, Note, Chip } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { HeartButton } from "@/features/reactions/heart-button";
import { copyText, downloadImage, shareOrDownloadImage, shareText } from "./share";
import type { AdTemplate } from "@/data/types";

const ALL = "Todos";

export function AdsScreen({
  ads,
  reactedIds,
}: {
  ads: AdTemplate[];
  reactedIds: string[];
}) {
  const reacted = useMemo(() => new Set(reactedIds), [reactedIds]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    ads.forEach((a) => set.add(a.category || "General"));
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [ads]);
  const [cat, setCat] = useState(ALL);
  const visible = cat === ALL ? ads : ads.filter((a) => (a.category || "General") === cat);

  return (
    <>
      <TopBarMain title="Vender" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>
          Anuncios listos para copiar y compartir. Elige uno y publícalo en tus redes.
        </p>

        {ads.length === 0 ? (
          <Note tone="blue" icon="megaphone">
            Aún no hay anuncios publicados. Tu administrador los subirá pronto.
          </Note>
        ) : (
          <>
            {categories.length > 2 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, margin: "0 -2px" }}>
                {categories.map((c) => {
                  const on = c === cat;
                  return (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className="ns-press"
                      style={{
                        flexShrink: 0,
                        padding: "9px 16px",
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 15,
                        border: on ? "none" : "1.5px solid var(--border-strong)",
                        background: on ? "var(--blue)" : "var(--surface)",
                        color: on ? "#fff" : "var(--text-2)",
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}

            {visible.map((ad) => (
              <AdCard key={ad.id} ad={ad} reacted={reacted.has(ad.id)} />
            ))}
          </>
        )}
      </div>
    </>
  );
}

function AdCard({ ad, reacted }: { ad: AdTemplate; reacted: boolean }) {
  const [busy, setBusy] = useState<null | "share" | "download">(null);

  async function onCopy() {
    try {
      await copyText(ad.bodyText);
      toast.success("Texto copiado. Pégalo donde quieras.");
    } catch {
      toast.error("No se pudo copiar el texto.");
    }
  }

  async function onShare() {
    setBusy("share");
    try {
      if (ad.imageUrl) {
        const r = await shareOrDownloadImage(ad.imageUrl, ad.title, {
          title: ad.title,
          text: ad.bodyText,
        });
        toast.success(r === "shared" ? "Listo para compartir." : "Imagen descargada.");
      } else {
        const r = await shareText(ad.bodyText, ad.title);
        toast.success(r === "shared" ? "Listo para compartir." : "Texto copiado.");
      }
    } catch {
      toast.error("No se pudo compartir.");
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    if (!ad.imageUrl) return;
    setBusy("download");
    try {
      await downloadImage(ad.imageUrl, ad.title);
      toast.success("Imagen descargada.");
    } catch {
      toast.error("No se pudo descargar la imagen.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      {ad.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.imageUrl}
          alt={ad.title}
          style={{ width: "100%", display: "block", aspectRatio: "1 / 1", objectFit: "cover" }}
        />
      )}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Chip tone="orange" icon="bag">
          {ad.category || "General"}
        </Chip>
        <h3 style={{ fontSize: 20, lineHeight: 1.25 }}>{ad.title}</h3>
        {ad.bodyText && (
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--text)", whiteSpace: "pre-wrap" }}>
            {ad.bodyText}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <ActionBtn icon="copy" label="Copiar" onClick={onCopy} />
          <ActionBtn icon="share" label="Compartir" onClick={onShare} busy={busy === "share"} />
          {ad.imageUrl && (
            <ActionBtn icon="download" label="Imagen" onClick={onDownload} busy={busy === "download"} />
          )}
          <div style={{ marginLeft: "auto" }}>
            <HeartButton type="ad" contentId={ad.id} initialReacted={reacted} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  busy,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="ns-press"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 999,
        background: "var(--blue-soft)",
        color: "var(--blue-dark)",
        fontWeight: 600,
        fontSize: 15,
        minHeight: 44,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <Icon name={icon} size={18} color="var(--blue-dark)" strokeWidth={2.2} />
      {label}
    </button>
  );
}
