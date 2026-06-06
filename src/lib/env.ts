import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_DATA_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
  NEXT_PUBLIC_APP_NAME: z.string().default("NetScale"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional().or(z.literal("")),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  VAPID_PRIVATE_KEY: z.string().optional().or(z.literal("")),
  OPENAI_API_KEY: z.string().optional().or(z.literal("")),
  VAPID_SUBJECT: z.string().default("mailto:soporte@nexomentor.app"),
  CRON_SECRET: z.string().optional().or(z.literal("")),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});

export const serverEnv = serverSchema.parse({
  ...env,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT,
  CRON_SECRET: process.env.CRON_SECRET,
});

export function getSupabasePublishableKey() {
  return env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
