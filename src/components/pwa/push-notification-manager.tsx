"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Bell, BellRing, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}

export function PushNotificationManager({
  userId,
  businessId,
}: {
  userId: string;
  businessId: string | null;
}) {
  // Estado SSR-estable: se sincroniza tras montar para evitar hydration mismatch.
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isInstalled, setIsInstalled] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Sincroniza estado solo-cliente tras montar para evitar hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    if ("Notification" in window) setPermission(Notification.permission);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const supported = useMemo(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window,
    [],
  );

  function enableNotifications() {
    if (!supported) {
      toast.error("Este navegador no soporta notificaciones push.");
      return;
    }

    startTransition(async () => {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission !== "granted") {
        toast.error("Permiso de notificaciones no concedido.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      if (vapidKey && "PushManager" in window) {
        const existing = await registration.pushManager.getSubscription();
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          }));

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            userId,
            businessId,
            subscription: subscription.toJSON(),
          }),
        });
      }

      toast.success("Notificaciones activadas.");
    });
  }

  function testNotification() {
    if (permission !== "granted") {
      toast.error("Activa notificaciones primero.");
      return;
    }
    startTransition(async () => {
      // Push real (servidor -> Web Push -> service worker).
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Contenido nuevo",
          body: "Tienes anuncios y presentaciones listos para compartir.",
          url: "/vender",
        }),
      }).catch(() => null);

      if (response?.ok) {
        toast.success("Te enviamos una notificacion de prueba.");
        return;
      }

      // Respaldo local si el envio por servidor no llega.
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Contenido nuevo", {
        body: "Tienes anuncios y presentaciones listos para compartir.",
        icon: "/icons/icon-192.png",
        data: { url: "/vender" },
      });
      toast.success("Notificacion de prueba mostrada.");
    });
  }

  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 text-brand-950">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BellRing className="mt-1 size-6 shrink-0" />
          <div>
            <p className="font-semibold">Notificaciones push</p>
            <p className="mt-1">
              Prioridad del producto: recordarte seguimientos aunque cierres la app.
            </p>
            <p className="mt-1 flex items-center gap-2 text-brand-800">
              <Smartphone className="size-4" />
              {isInstalled ? "PWA instalada" : "Puedes instalarla como app"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={enableNotifications} loading={pending}>
            <Bell className="size-5" />
            {permission === "granted" ? "Revisar permiso" : "Activar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={testNotification}
            disabled={permission !== "granted"}
          >
            Probar
          </Button>
        </div>
      </div>
    </div>
  );
}
