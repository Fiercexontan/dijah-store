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

  const { error } = await supabase.from("store_settings").upsert(
    {
      key: "whatsapp_number",
      value: number,
      is_public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) redirect("/admin/settings?error=save");

  // Every page that shows a WhatsApp link picks up the new number
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}