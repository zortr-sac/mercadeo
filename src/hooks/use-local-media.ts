"use client";

import { useEffect, useState } from "react";
import { getLocalMediaUrl } from "@/lib/offline/download";

/**
 * Devuelve qué reproducir: si el medio está descargado en IndexedDB, un objectURL
 * local (funciona sin internet y ahorra datos); si no, la URL original. Revoca el
 * objectURL al desmontar / cambiar de URL.
 */
export function useLocalMedia(url: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<{ url: string | null; src: string } | null>(null);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    void (async () => {
      const local = await getLocalMediaUrl(url);
      if (active && local) {
        created = local;
        setResolved({ url: url ?? null, src: local });
      }
    })();
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url]);

  return resolved && resolved.url === (url ?? null) ? resolved.src : url ?? null;
}
