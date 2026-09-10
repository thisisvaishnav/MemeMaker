import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  import.meta.env.PUBLIC_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env.PUBLIC_SUPABASE_URL : "") ||
  "https://placeholder.supabase.co"
).trim();

const supabaseAnonKey = (
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env.PUBLIC_SUPABASE_ANON_KEY : "") ||
  "placeholder-anon-key"
).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
