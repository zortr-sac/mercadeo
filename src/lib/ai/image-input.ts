import "server-only";

export interface InlineImage {
  /** base64 sin el prefijo `data:`. */
  data: string;
  mimeType: string;
}

/**
 * Normaliza la imagen que envía el cliente a `{ data, mimeType }` para Gemini.
 * Acepta un data URL (`data:image/png;base64,XXXX`) o base64 crudo + su mime.
 * Devuelve `undefined` si no hay imagen utilizable.
 */
export function parseInlineImage(
  imageBase64?: string | null,
  imageMimeType?: string | null,
): InlineImage | undefined {
  if (!imageBase64) return undefined;
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: imageMimeType ?? "image/png", data: imageBase64 };
}
