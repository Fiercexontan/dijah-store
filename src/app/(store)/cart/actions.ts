"use server";

import { createClient } from "@/lib/supabase/server";

export type CartItem = {
  variantId: string;
  name: string;
  slug: string;
  colorName: string;
  sizeLabel: string;
  unitPriceKobo: number;
  stock: number;
  isPreorder: boolean;
  imageUrl: string | null;
};

function one<T>(x: T | T[] | null | undefined): T | null {
  return Array.isArray(x) ? (x[0] ?? null) : (x ?? null);
}

export async function getCartItems(variantIds: string[]): Promise<CartItem[]> {
  const ids = (Array.isArray(variantIds) ? variantIds : [])
    .filter((id) => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id))
    .slice(0, 50);
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select(
      "id, size_label, stock_quantity, color_id, product_colors(name), products(name, slug, price_kobo, sale_price_kobo, is_preorder, product_images(color_id, storage_path, sort_order))"
    )
    .in("id", ids);

  const items: CartItem[] = [];
  for (const v of data ?? []) {
    const product = one(v.products);
    const color = one(v.product_colors);
    // Items from products that are no longer on sale are simply not returned
    if (!product || !color) continue;

    const images = [...(product.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const img = images.find((i) => i.color_id === v.color_id) ?? images[0];

    items.push({
      variantId: v.id,
      name: product.name,
      slug: product.slug,
      colorName: color.name,
      sizeLabel: v.size_label,
      unitPriceKobo: product.sale_price_kobo ?? product.price_kobo,
      stock: v.stock_quantity,
      isPreorder: product.is_preorder,
      imageUrl: img
        ? supabase.storage.from("product-images").getPublicUrl(img.storage_path)
            .data.publicUrl
        : null,
    });
  }
  return items;
}