"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia, type MediaKind } from "@/lib/supabase/storage";
import {
  AUDIO_MIME,
  MAX_AUDIO_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_MIME,
} from "@/lib/media";
import { cn } from "@/lib/utils";

type Accept = "video" | "audio" | "image";

const ACCEPT_ATTR: Record<Accept, string> = {
  video: "video/*",
  audio: "audio/*",
  image: "image/*",
};

const DEFAULT_MAX: Record<Accept, number> = {
  video: MAX_VIDEO_BYTES,
  audio: MAX_AUDIO_BYTES,
  image: 5 * 1024 * 1024,
};

function mb(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/** Lee la duración (segundos) de un archivo de audio/video; 0 si no aplica. */
function readDuration(file: File, accept: Accept): Promise<number> {
  if (accept === "image") return Promise.resolve(0);
  return new Promise((resolve) => {
    const el = document.createElement(accept === "video" ? "video" : "audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      resolve(Number.isFinite(el.duration) ? Math.round(el.duration) : 0);
    };
    el.onerror = () => resolve(0);
    el.src = URL.createObjectURL(file);
  });
}

export function FileUpload({
  businessId,
  folder,
  accept,
  maxBytes,
  currentUrl,
  label,
  onUploaded,
}: {
  businessId: string;
  folder: MediaKind;
  accept: Accept;
  maxBytes?: number;
  currentUrl?: string | null;
  label?: string;
  onUploaded: (result: { url: string; path: string; durationSeconds: number }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">(
    currentUrl ? "done" : "idle",
  );
  const [name, setName] = useState<string>("");
  const limit = maxBytes ?? DEFAULT_MAX[accept];

  async function handleFile(file: File) {
    if (file.size > limit) {
      toast.error(`El archivo supera el máximo (${mb(limit)}).`);
      return;
    }
    const allowed =
      accept === "video"
        ? VIDEO_MIME
        : accept === "audio"
          ? AUDIO_MIME
          : ["image/png", "image/jpeg", "image/webp"];
    if (file.type && !allowed.includes(file.type)) {
      toast.error("Formato de archivo no admitido.");
      return;
    }
    setState("uploading");
    setName(file.name);
    try {
      const durationSeconds = await readDuration(file, accept);
      const { url, path } = await uploadMedia(file, businessId, folder);
      onUploaded({ url, path, durationSeconds });
      setState("done");
      toast.success("Archivo subido.");
    } catch {
      setState("idle");
      toast.error("No se pudo subir el archivo. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR[accept]}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed border-border px-4 py-6 text-base font-medium transition-colors hover:border-brand-400 hover:bg-muted disabled:opacity-70",
          state === "done" && "border-brand-300 bg-brand-50 text-brand-900",
        )}
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Subiendo…
          </>
        ) : state === "done" ? (
          <>
            <CheckCircle2 className="size-5 text-green-600" aria-hidden />
            {name || label || "Archivo listo"} — cambiar
          </>
        ) : (
          <>
            <Upload className="size-5" aria-hidden />
            {label ?? "Subir archivo"} (máx. {mb(limit)})
          </>
        )}
      </button>
      {state === "done" && currentUrl && accept === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="" className="h-20 rounded-md object-cover" />
      )}
      {state === "uploading" && (
        <p className="flex items-center gap-1 text-sm text-muted-foreground" role="status">
          No cierres esta ventana mientras se sube.
        </p>
      )}
      {state === "done" && (
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setName("");
            onUploaded({ url: "", path: "", durationSeconds: 0 });
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden /> Quitar
        </button>
      )}
    </div>
  );
}
