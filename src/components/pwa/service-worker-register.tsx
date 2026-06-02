"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (process.env.NODE_ENV !== "production" && !isLocalhost) return;

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
