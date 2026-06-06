/** Helpers para compartir/descargar/copiar el contenido de los anuncios.
 *  Usan la hoja nativa de compartir (WhatsApp/Instagram/TikTok/Facebook…) cuando
 *  está disponible, con descarga o copia al portapapeles como respaldo. */

async function fetchAsFile(src: string, name: string): Promise<File> {
  const blob = await (await fetch(src)).blob();
  const type = blob.type || "image/jpeg";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  return new File([blob], `${slugifyName(name)}.${ext}`, { type });
}

function triggerDownload(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Comparte una imagen (+ texto opcional) por la hoja nativa; descarga si no se puede. */
export async function shareOrDownloadImage(
  src: string,
  name: string,
  opts: { title?: string; text?: string } = {},
): Promise<"shared" | "downloaded"> {
  const file = await fetchAsFile(src, name);
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: opts.title ?? "Mira esto", text: opts.text });
      return "shared";
    } catch {
      // el usuario canceló -> caemos a descarga
    }
  }
  triggerDownload(file);
  return "downloaded";
}

/** Descarga una imagen (sin intentar compartir). */
export async function downloadImage(src: string, name: string): Promise<void> {
  triggerDownload(await fetchAsFile(src, name));
}

/** Comparte solo texto por la hoja nativa; copia al portapapeles como respaldo. */
export async function shareText(
  text: string,
  title = "Mira esto",
): Promise<"shared" | "copied"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text, title });
      return "shared";
    } catch {
      // cancelado -> copiamos
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

/** Copia texto al portapapeles. */
export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function slugifyName(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "anuncio"
  );
}
