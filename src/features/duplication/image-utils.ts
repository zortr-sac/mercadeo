/**
 * Utilidades de imagen del lado del navegador para el asistente de conversación.
 * Objetivo: mantener el payload chico antes de enviarlo a la IA.
 */

/** Lado mayor máximo (px) al que reducimos la captura antes de enviarla. */
const MAX_EDGE = 1280;
/** Calidad JPEG del export (0–1). Buen balance nitidez/peso para leer un chat. */
const JPEG_QUALITY = 0.8;

export interface PreparedImage {
  /** Data URL 'data:image/jpeg;base64,...' listo para `imageBase64`. */
  dataUrl: string;
  /** MIME final (siempre image/jpeg tras el reescalado). */
  mimeType: "image/jpeg";
  /** Tamaño aproximado del payload en KB (para mostrar al usuario). */
  approxKb: number;
}

/** Lee un File como data URL (para previsualizar y como fuente del canvas). */
function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

/** Carga un data URL en un HTMLImageElement decodificado. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo abrir la imagen."));
    img.src = src;
  });
}

/**
 * Reduce la imagen a un máximo de ~1280px en el lado mayor y la exporta a
 * JPEG calidad ~0.8. Devuelve un data URL pequeño que el backend acepta.
 */
export async function prepareScreenshot(file: File): Promise<PreparedImage> {
  const sourceUrl = await readAsDataUrl(file);
  const img = await loadImage(sourceUrl);

  const { naturalWidth: w, naturalHeight: h } = img;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Sin canvas 2D no podemos reescalar; usa el original tal cual.
    return {
      dataUrl: sourceUrl,
      mimeType: "image/jpeg",
      approxKb: Math.round((sourceUrl.length * 3) / 4 / 1024),
    };
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

  // base64 ≈ 4/3 del binario; estimamos el peso del payload.
  const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
  const approxKb = Math.round((base64Length * 3) / 4 / 1024);

  return { dataUrl, mimeType: "image/jpeg", approxKb };
}

/** Extrae el primer archivo de imagen de un ClipboardEvent (pegar con Ctrl/Cmd+V). */
export function imageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
