"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Btn } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { useOfflineStore } from "@/store/offline-store";
import type { DownloadProgress } from "@/lib/offline/download";

/**
 * Botón "Descargar para usar sin internet" con progreso. `variant="compact"` para
 * tarjetas pequeñas (icono), `"full"` para una acción principal.
 */
export function DownloadButton({
  itemKey,
  downloaded,
  variant = "full",
  label = "Descargar para ver sin internet",
  download,
  remove,
  onChange,
}: {
  itemKey: string;
  downloaded: boolean;
  variant?: "full" | "compact";
  label?: string;
  download: (onProgress: (p: DownloadProgress) => void) => Promise<{ skipped?: number } | void>;
  remove: () => Promise<void>;
  onChange: (downloaded: boolean) => void;
}) {
  const status = useOfflineStore((s) => s.status[itemKey]);
  const setStatus = useOfflineStore((s) => s.setStatus);
  const [busy, setBusy] = useState(false);
  const downloading = busy || status?.state === "downloading";
  const pct = status && status.total ? Math.round((status.done / status.total) * 100) : 0;

  async function start() {
    setBusy(true);
    setStatus(itemKey, { state: "downloading", done: 0, total: 0 });
    try {
      const res = await download((p) =>
        setStatus(itemKey, { state: "downloading", done: p.done, total: p.total }),
      );
      setStatus(itemKey, { state: "done", done: 0, total: 0 });
      onChange(true);
      const skipped =
        res && typeof res === "object" && "skipped" in res ? (res.skipped ?? 0) : 0;
      toast.success(
        skipped
          ? `Listo. ${skipped} video(s) de YouTube no se pueden guardar sin internet.`
          : "Descargado para usar sin internet.",
      );
    } catch {
      setStatus(itemKey, { state: "error", done: 0, total: 0 });
      toast.error("No se pudo descargar. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!window.confirm("¿Quitar esta descarga del teléfono?")) return;
    try {
      await remove();
      onChange(false);
      setStatus(itemKey, { state: "idle", done: 0, total: 0 });
      toast.success("Descarga eliminada.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  }

  if (variant === "compact") {
    if (downloading) {
      return (
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", minWidth: 48, textAlign: "center" }}>
          {pct ? `${pct}%` : "…"}
        </span>
      );
    }
    return (
      <button
        className="ns-press"
        onClick={downloaded ? del : start}
        aria-label={downloaded ? "Quitar descarga" : "Descargar"}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none" }}
      >
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            background: downloaded ? "var(--green-soft)" : "var(--blue-soft)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name={downloaded ? "check" : "download"} size={22} color={downloaded ? "var(--green)" : "var(--blue)"} />
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: downloaded ? "var(--green)" : "var(--blue)" }}>
          {downloaded ? "Listo" : "Bajar"}
        </span>
      </button>
    );
  }

  if (downloaded) {
    return (
      <Btn size="md" variant="soft" icon="check" onClick={del}>
        Descargado · Quitar
      </Btn>
    );
  }
  if (downloading) {
    return (
      <Btn size="md" variant="outline" onClick={() => {}}>
        Descargando… {pct ? `${pct}%` : ""}
      </Btn>
    );
  }
  return (
    <Btn size="md" variant="outline" icon="download" onClick={start}>
      {label}
    </Btn>
  );
}
