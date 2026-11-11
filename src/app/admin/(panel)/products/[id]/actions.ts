"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export async function setStatus(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "active", "archived"].includes(status)) return;

  const { error } = await supabase
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) redirect(`/admin/products/${id}?error=status`);

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
}

export async function addColor(formData: FormData) {
  const { supabase } = await requireAdmin();

  const productId = String(formData.get("product_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!productId || !name) redirect(`/admin/products/${productId}?error=color`);

  const { count } = await supabase
    .from("product_colors")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error } = await supabase.from("product_colors").insert({
    product_id: productId,
    name,
    sort_order: count ?? 0,
  });

  // The same colour name twice on one product is rejected by the database
  if (error) redirect(`/admin/products/${productId}?error=color`);

  revalidatePath(`/admin/products/${productId}`);
}


export async function saveStock(formData: FormData) {
  const { supabase } = await requireAdmin();

  const productId = String(formData.get("product_id") ?? "");
  const colorId = String(formData.get("color_id") ?? "");
  if (!productId || !colorId) return;

  // The colour must really belong to this product
  const { data: color } = await supabase
    .from("product_colors")
    .select("id")
    .eq("id", colorId)
    .eq("product_id", productId)
    .maybeSingle();
  if (!color) redirect(`/admin/products/${productId}?error=stock`);

  const rows: {
    product_id: string;
    color_id: string;
    size_label: string;
    stock_quantity: number;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock_")) continue;
    const raw = String(value).trim();
    if (raw === "") continue; // blank means this size isn't offered
    const qty = Number(raw);
    const size = key.slice(6);
    if (!Number.isInteger(qty) || qty < 0 || size.length > 10) {
      redirect(`/admin/products/${productId}?error=stock`);
    }
    rows.push({
      product_id: productId,
      color_id: colorId,
      size_label: size,
      stock_quantity: qty,
    });
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("product_variants")
    .upsert(rows, { onConflict: "product_id,color_id,size_label" });
  if (error) redirect(`/admin/products/${productId}?error=stock`);

  revalidatePath(`/admin/products/${productId}`);
}