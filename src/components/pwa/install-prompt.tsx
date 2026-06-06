"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "nexo-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-3 z-40 mx-auto max-w-md rounded-lg border border-border bg-card p-4 shadow-lg lg:left-auto lg:right-6 lg:mx-0"
      style={{ bottom: "calc(5rem + var(--safe-bottom))" }}
    >
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        aria-label="Descartar"
      >
        <X className="size-5" />
      </button>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg gradient-brand text-white">
          <Download className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Instala NetScale</p>
          <p className="text-muted-foreground">
            Anade la PWA a tu pantalla de inicio para acceso rapido y uso sin
            conexion.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={install}>
              Instalar
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
