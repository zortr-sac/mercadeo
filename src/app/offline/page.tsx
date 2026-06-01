import { WifiOff } from "lucide-react";

export const metadata = { title: "Sin conexión" };

/** Página mostrada por el service worker cuando no hay red. */
export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-7" />
      </div>
      <h1 className="font-display text-xl font-bold">Sin conexión</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        No pudimos conectar. Revisa tu internet. El contenido que ya visitaste
        sigue disponible sin conexión.
      </p>
    </div>
  );
}
