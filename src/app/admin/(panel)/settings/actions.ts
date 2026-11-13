"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

// Accepts 0704..., +234704... or 234704... and stores the international form
function normalise(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  if (/^0\d{10}$/.test(digits)) return "234" + digits.slice(1);
  if (/^234\d{10}$/.test(digits)) return digits;
  return null;
}

export async function saveSettings(formData: FormData) {
  const { supabase } = await requireAdmin();

  const number = normalise(String(formData.get("whatsapp") ?? ""));
  if (!number) redirect("/admin/settings?error=whatsapp");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    redirect("/admin/settings?error=email");
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("store_settings").upsert(
    { key: "whatsapp_number", value: number, is_public: true, updated_at: now },
    { onConflict: "key" }
  );
  if (error) redirect("/admin/settings?error=save");

  if (email) {
    const { error: emailError } = await supabase.from("store_settings").upsert(
      { key: "contact_email", value: email, is_public: true, updated_at: now },
      { onConflict: "key" }
    );
    if (emailError) redirect("/admin/settings?error=save");
  } else {
    // An empty box means: don't show an email on the website
    await supabase.from("store_settings").delete().eq("key", "contact_email");
  }

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}