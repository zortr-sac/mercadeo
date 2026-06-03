import { createClient } from "@/lib/supabase/client";
import { DATA_SOURCE } from "@/lib/constants";
import { extFromFile } from "@/lib/media";

export const MEDIA_BUCKET = "business-media";

export type MediaKind = "academia" | "audiolibros";

export interface UploadResult {
  url: string;
  path: string;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Sube un archivo al bucket público `business-media` en `{businessId}/{kind}/{uuid}.{ext}`
 * usando el cliente del navegador (la sesión satisface la RLS de escritura del negocio).
 * Devuelve la URL pública. En modo mock devuelve un object URL (sin subir).
 */
export async function uploadMedia(
  file: File,
  businessId: string,
  kind: MediaKind,
): Promise<UploadResult> {
  const path = `${businessId}/${kind}/${uuid()}.${extFromFile(file)}`;

  if (DATA_SOURCE !== "supabase") {
    return { url: URL.createObjectURL(file), path };
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
