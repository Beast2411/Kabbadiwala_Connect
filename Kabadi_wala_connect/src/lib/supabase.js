import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const clientUrl = supabaseUrl || "https://placeholder.supabase.co";
const clientKey = supabaseAnonKey || "placeholder-anon-key";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env"
  );
}

// Keep the app renderable when deployment env vars are missing. Services still
// use isSupabaseConfigured to block database actions until they are configured.
export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
