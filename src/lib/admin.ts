import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Call this at the top of every admin page and every admin action.
export async function requireAdmin() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) redirect("/admin/login");

  return { supabase, userId };
}