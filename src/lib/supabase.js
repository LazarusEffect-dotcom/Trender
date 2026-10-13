import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  url &&
  anonKey &&
  !url.includes("YOUR_PROJECT") &&
  !anonKey.includes("YOUR_KEY") &&
  url.startsWith("https://")
);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
