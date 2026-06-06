"use client";

import { useEffect } from "react";
import { useOfflineStore } from "@/store/offline-store";

/** Hidrata el estado de descargas (IndexedDB) y escucha online/offline. */
export function OfflineBootstrap() {
  const hydrate = useOfflineStore((s) => s.hydrate);
  const setOnline = useOfflineStore((s) => s.setOnline);

  useEffect(() => {
    void hydrate();
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [hydrate, setOnline]);

  return null;
}
