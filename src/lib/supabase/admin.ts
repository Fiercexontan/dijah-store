import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the secret key, which bypasses row level security.
// Only call this from server code that has already validated its input.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase server credentials are not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}