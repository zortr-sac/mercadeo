"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // En desarrollo el service worker cachea los chunks de Turbopack
    // (stale-while-revalidate sobre /_next/static) y los sirve obsoletos tras
    // cambiar el código, provocando errores de "module factory not available".
    // Por eso SOLO lo activamos en producción (donde los chunks tienen hash
    // inmutable). En dev desregistramos cualquier SW previo y limpiamos sus
    // caches para que la app cargue siempre fresca.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister()))
        .catch(() => {});
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) => keys.forEach((key) => caches.delete(key)))
          .catch(() => {});
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // La app sigue funcionando sin offline/push.
      });
    };

    // El efecto corre después del evento `load`, así que registramos de inmediato
    // si el documento ya cargó; si no, esperamos al `load`.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
