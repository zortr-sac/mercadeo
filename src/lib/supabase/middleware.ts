import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  MEMBER_SLUG_COOKIE,
  SESSION_ID_COOKIE,
  isBusinessLoginPath,
} from "@/lib/constants";

export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const hasUser = Boolean(claims);
  const userId = (claims?.sub as string | undefined) ?? undefined;
  const pathname = request.nextUrl.pathname;

  // `/{slug}` (negocio) es público, igual que login/registro/legales.
  const businessLogin = isBusinessLoginPath(pathname);
  const isPublic =
    pathname.startsWith("/bienvenida") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/terminos") ||
    pathname.startsWith("/privacidad") ||
    pathname.startsWith("/offline") ||
    businessLogin;

  // Sesión única: si el token de la cookie no coincide con el del perfil, este
  // dispositivo fue desplazado por un login más nuevo → cerrar sesión y reenviar.
  if (hasUser && userId) {
    const sidCookie = request.cookies.get(SESSION_ID_COOKIE)?.value ?? null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_session_id")
      .eq("id", userId)
      .maybeSingle();
    const activeSid =
      (profile as { active_session_id?: string | null } | null)?.active_session_id ??
      null;

    if (activeSid && sidCookie !== activeSid) {
      const memberSlug = request.cookies.get(MEMBER_SLUG_COOKIE)?.value;
      const dest = request.nextUrl.clone();
      dest.pathname = memberSlug ? `/${memberSlug}` : "/login";
      const redirectRes = NextResponse.redirect(dest);
      // Cierra la sesión de ESTE dispositivo: borra las cookies de auth de
      // Supabase (sb-*) y el token de sesión única. El dispositivo nuevo conserva
      // su propia sesión → una cuenta = una sola sesión activa.
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-") || cookie.name === SESSION_ID_COOKIE) {
          redirectRes.cookies.delete(cookie.name);
        }
      });
      return redirectRes;
    }
  }

  if (!hasUser && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/bienvenida";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    hasUser &&
    (pathname === "/bienvenida" || pathname.startsWith("/login") || businessLogin)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
