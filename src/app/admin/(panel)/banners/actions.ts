"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type BannerInput = {
  path: string;
  title: string;
  subtitle: string;
  link: string;
  startDate: string; // yyyy-mm-dd or empty
  endDate: string; // yyyy-mm-dd or empty
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const LINK = /^\/[A-Za-z0-9\-._~/?=&%#]*$/;
const PATH = /^banners\/[0-9a-f-]{36}\.jpg$/;

function refresh() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createBanner(
  input: BannerInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { supabase } = await requireAdmin();

  const title = String(input?.title ?? "").trim();
  const subtitle = String(input?.subtitle ?? "").trim();
  const link = String(input?.link ?? "").trim();
  const startDate = String(input?.startDate ?? "").trim();
  const endDate = String(input?.endDate ?? "").trim();
  const path = String(input?.path ?? "");

  if (!PATH.test(path)) return { ok: false, message: "The photo did not upload correctly." };
  if (title.length < 2 || title.length > 80) {
    return { ok: false, message: "Enter a headline of 2 to 80 characters." };
  }
  if (subtitle.length > 160) {
    return { ok: false, message: "Keep the line under the headline to 160 characters." };
  }
  if (link && (!LINK.test(link) || link.startsWith("//") || link.length > 200)) {
    return { ok: false, message: "The link must be a page on this site, such as /shop." };
  }
  if ((startDate && !DATE.test(startDate)) || (endDate && !DATE.test(endDate))) {
    return { ok: false, message: "Enter valid dates." };
  }
  if (startDate && endDate && endDate < startDate) {
    return { ok: false, message: "The end date can't be before the start date." };
  }

  const { count } = await supabase
    .from("promo_banners")
    .select("id", { count: "exact", head: true });

  // Nigeria is always UTC+1, so the day starts and ends on Lagos time
  const { error } = await supabase.from("promo_banners").insert({
    title,
    subtitle: subtitle || null,
    image_path: path,
    link_url: link || null,
    starts_at: startDate ? `${startDate}T00:00:00+01:00` : null,
    ends_at: endDate ? `${endDate}T23:59:59+01:00` : null,
    sort_order: count ?? 0,
    is_active: true,
  });
  if (error) {
    console.error("banner insert failed", error.message);
    return { ok: false, message: "Could not save the banner. Please try again." };
  }

  refresh();
  return { ok: true };
}

export async function toggleBanner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const on = formData.get("on") === "1";
  if (!id) return;

  await supabase.from("promo_banners").update({ is_active: on }).eq("id", id);
  refresh();
}

export async function deleteBanner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: banner } = await supabase
    .from("promo_banners")
    .select("id, image_path")
    .eq("id", id)
    .maybeSingle();
  if (!banner) return;

  await supabase.storage.from("product-images").remove([banner.image_path]);
  await supabase.from("promo_banners").delete().eq("id", id);
  refresh();
}