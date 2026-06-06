"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/netscale/icons";
import { prepareScreenshot, type PreparedImage } from "@/features/duplication/image-utils";

/**
 * Campo reutilizable para adjuntar una imagen (anuncios y presentaciones).
 * Reescala/comprime con prepareScreenshot y entrega el PreparedImage al padre,
 * que envía dataUrl + mimeType al endpoint de IA junto al texto.
 */
export function ImageAttachField({
  value,
  onChange,
  label = "Agregar imagen (opcional)",
  hint,
}: {
  value: PreparedImage | null;
  onChange: (image: PreparedImage | null) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await prepareScreenshot(file));
    } catch {
      onChange(null);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {value ? (
        <div style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.dataUrl}
            alt="Imagen adjunta"
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 14, display: "block" }}
          />
          <button
            type="button"
            className="ns-press"
            onClick={clear}
            style={{
              position: "absolute", top: 8, right: 8, background: "rgba(15,23,42,.82)", color: "#fff",
              border: "none", borderRadius: 999, padding: "6px 14px", fontSize: 14, fontWeight: 600,
            }}
          >
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="ns-press"
          onClick={() => inputRef.current?.click()}
          style={{
            minHeight: 56, borderRadius: 14, border: "1.5px dashed var(--border)", background: "var(--surface)",
            color: "var(--text-2)", fontSize: 16, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <Icon name="image" size={22} color="var(--text-2)" />
          {busy ? "Procesando imagen…" : label}
        </button>
      )}
      {hint && <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>{hint}</p>}
    </div>
  );
}
