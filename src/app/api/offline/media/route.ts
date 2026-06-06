import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Proxy same-origin para descargar un objeto PÚBLICO de Storage sin problemas de
 * CORS (la descarga ocurre online). Solo permite objetos del bucket
 * `business-media` de NUESTRO proyecto (anti-SSRF) y streamea el archivo.
 */
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Falta el parámetro url." }, { status: 400 });
  }

  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  const prefix = `${base}/storage/v1/object/public/business-media/`;
  if (!base || !url.startsWith(prefix)) {
    return NextResponse.json({ error: "URL no permitida." }, { status: 400 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "No se pudo descargar el archivo." }, { status: 502 });
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  const len = upstream.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);

  return new NextResponse(upstream.body, { status: 200, headers });
}
