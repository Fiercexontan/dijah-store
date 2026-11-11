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