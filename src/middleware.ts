import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Protección de rutas (mock): exige cookie de sesión en el área autenticada.
 * En fase 2 se sustituye por el refresh de sesión de Supabase (@supabase/ssr),
 * manteniendo el mismo patrón de cookie.
 */
const PUBLIC_PATHS = ["/login", "/offline"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Sin sesión y ruta protegida → al login.
  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión y en login → al inicio.
  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/** Aplica a todo excepto assets estáticos, API y archivos PWA. */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|offline|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
