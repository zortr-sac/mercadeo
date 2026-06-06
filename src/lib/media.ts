/** Utilidades de media puras (sin Supabase): se usan en cliente y servidor. */

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB

export const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];
export const AUDIO_MIME = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/x-m4a"];

export const MAX_DOC_BYTES = 100 * 1024 * 1024; // 100 MB (PPT/PPTX/PDF)
export const DOC_MIME = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/**
 * ¿La URL es un archivo de video subido (vs un embed de YouTube/Vimeo)?
 * Los archivos del bucket público se sirven en /storage/v1/object/public/.
 */
export function isFileVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("/storage/v1/object/public/") || VIDEO_EXT.test(url);
}

export function extFromFile(file: File): string {
  const fromName = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  if (fromName) return fromName;
  const sub = file.type.split("/")[1];
  return sub ? sub.replace("quicktime", "mov").replace("x-m4a", "m4a") : "bin";
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Tamaño de archivo legible (KB/MB). Vacío si no hay. */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
