import { createClient } from "@supabase/supabase-js";

// Read Supabase environment variables safely
const supabaseUrl: string =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
  (typeof process !== "undefined" && process.env?.["SUPABASE_URL"]) ||
  "";

const supabaseAnonKey: string =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_ANON_KEY"]) ||
  (typeof process !== "undefined" && process.env?.["SUPABASE_ANON_KEY"]) ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Helper to test Supabase connection health
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      connected: false,
      message: "Supabase credentials (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) not provided in .env",
    };
  }

  try {
    const { error } = await supabase.from("produce").select("id").limit(1);
    if (error) {
      return {
        connected: false,
        message: `Supabase query error: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: "Successfully connected to Supabase PostgreSQL database!",
    };
  } catch (err: unknown) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }
}
