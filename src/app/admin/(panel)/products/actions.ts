"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const isPreorder = formData.get("is_preorder") === "on";

  if (!name || !categoryId || !Number.isFinite(price) || price <= 0) {
    redirect("/admin/products/new?error=invalid");
  }

  // Short random ending keeps every product link unique
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    category_id: categoryId,
    description: description || null,
    price_kobo: Math.round(price * 100),
    is_preorder: isPreorder,
    status: "draft",
  });

  if (error) redirect("/admin/products/new?error=failed");

  redirect("/admin/products");
}