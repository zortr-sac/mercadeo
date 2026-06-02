import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, getSupabasePublishableKey } from "@/lib/env";

export async function createClient() {
  const key = getSupabasePublishableKey();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error("Supabase server client is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies; middleware refreshes the session.
        }
      },
    },
  });
}
