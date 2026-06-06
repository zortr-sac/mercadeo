"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/netscale/icons";
import type { ContentReactionType } from "@/data/types";
import { toggleReactionAction } from "./reaction-actions";

const HEART_COLOR = "#EF4444";

/**
 * Botón de corazón (única reacción). Optimista: pinta el estado al instante y
 * revierte si la acción falla. Pensado para tarjetas de anuncios y presentaciones.
 */
export function HeartButton({
  type,
  contentId,
  initialReacted,
  initialCount = 0,
  showCount = false,
  size = 24,
}: {
  type: ContentReactionType;
  contentId: string;
  initialReacted: boolean;
  initialCount?: number;
  showCount?: boolean;
  size?: number;
}) {
  const [reacted, setReacted] = useState(initialReacted);
  const [count, setCount] = useState(initialCount);
  const [, start] = useTransition();

  function toggle() {
    const next = !reacted;
    // Optimista
    setReacted(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    start(async () => {
      try {
        const res = await toggleReactionAction(type, contentId);
        // Reconciliar con la verdad del servidor.
        setReacted(res.reacted);
        setCount((c) => {
          if (res.reacted === next) return c;
          return Math.max(0, c + (res.reacted ? 1 : -1));
        });
      } catch {
        // Revertir
        setReacted(!next);
        setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reacted}
      aria-label={reacted ? "Quitar me gusta" : "Me gusta"}
      className="ns-press"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        background: reacted ? "rgba(239,68,68,.10)" : "var(--surface)",
        border: `1.5px solid ${reacted ? "rgba(239,68,68,.35)" : "var(--border-strong)"}`,
        color: reacted ? HEART_COLOR : "var(--text-2)",
        fontWeight: 600,
        fontSize: 16,
        minHeight: 44,
      }}
    >
      <Icon
        name="heart"
        size={size}
        color={reacted ? HEART_COLOR : "var(--text-2)"}
        strokeWidth={2.2}
        style={{ fill: reacted ? HEART_COLOR : "none", transition: "fill .15s ease" }}
      />
      {showCount && count > 0 && <span>{count}</span>}
    </button>
  );
}
