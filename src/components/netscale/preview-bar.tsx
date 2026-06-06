"use client";
// Franja que indica al admin que está viendo un negocio "como miembro".
import { useTransition } from "react";
import { Icon } from "./icons";
import { exitBusinessPreviewAction } from "@/features/admin/preview-actions";

export function PreviewBar({ businessName }: { businessName: string }) {
  const [pending, start] = useTransition();
  return (
    <div style={{
      flexShrink: 0,
      background: "linear-gradient(90deg, var(--orange) 0%, var(--orange-light) 100%)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "max(env(safe-area-inset-top, 0px), 12px) 14px 12px",
    }}>
      <Icon name="eye" size={20} color="#fff" />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
        Viendo «{businessName}» como miembro
      </span>
      <button
        className="ns-press"
        onClick={() => start(() => exitBusinessPreviewAction())}
        disabled={pending}
        style={{
          background: "rgba(255,255,255,.25)", color: "#fff", fontWeight: 700, fontSize: 14,
          padding: "8px 16px", borderRadius: 999, border: "none", flexShrink: 0,
        }}
      >
        {pending ? "Saliendo…" : "Salir"}
      </button>
    </div>
  );
}
