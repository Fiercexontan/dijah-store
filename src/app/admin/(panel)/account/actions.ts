"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export async function changePassword(formData: FormData) {
  const { supabase } = await requireAdmin();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 10 || next.length > 72) redirect("/admin/account?error=short");
  if (next !== confirm) redirect("/admin/account?error=match");
  if (next === current) redirect("/admin/account?error=same");

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) redirect("/admin/login");

  // Prove it's really her: the current password must be right
  const { error: checkError } = await supabase.auth.signInWithPassword({
    email,
    password: current,
  });
  if (checkError) redirect("/admin/account?error=current");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) redirect("/admin/account?error=save");

  redirect("/admin/account?saved=1");
}