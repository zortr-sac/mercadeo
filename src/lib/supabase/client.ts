"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, getSupabasePublishableKey } from "@/lib/env";

export function createClient() {
  const key = getSupabasePublishableKey();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !key) {
    throw new Error("Supabase client is not configured.");
  }

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, key);
}
