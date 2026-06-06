import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isBusinessLoginPath } from "@/lib/constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/bienvenida", "/login", "/offline", "/registro", "/terminos", "/privacidad"];

export async function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase") {
    return updateSupabaseSession(request);
  }

  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic =
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    isBusinessLoginPath(pathname);

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|offline|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
