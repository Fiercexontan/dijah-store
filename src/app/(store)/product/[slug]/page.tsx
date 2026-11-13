import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { sizesFor } from "@/lib/sizes";
import ProductView from "@/components/ProductView";
import SizeGuide from "@/components/SizeGuide";

function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, description, price_kobo, sale_price_kobo, is_preorder, expected_date, categories(name, size_type), product_colors(id, name, sort_order), product_images(color_id, storage_path, sort_order), product_variants(id, color_id, size_label, stock_quantity)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  return { supabase, product: data };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProduct(slug);
  return {
        title: product ? product.name : "Product not found",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { supabase, product } = await getProduct(slug);
  if (!product) notFound();

  const category = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;
  const sizeOrder = sizesFor(category?.size_type);

  const publicUrl = (path: string) =>
    supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  const colors = [...(product.product_colors ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.id,
      name: c.name,
      images: (product.product_images ?? [])
        .filter((i) => i.color_id === c.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => publicUrl(i.storage_path)),
      sizes: (product.product_variants ?? [])
        .filter((v) => v.color_id === c.id)
        .map((v) => ({ id: v.id, label: v.size_label, stock: v.stock_quantity }))
        .sort((a, b) => sizeOrder.indexOf(a.label) - sizeOrder.indexOf(b.label)),
    }));

  const { data: setting } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  const expectedText = product.expected_date
    ? new Date(product.expected_date + "T00:00:00").toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isJeans =
    category?.size_type === "waist" || category?.size_type === "clothing_waist";

  return (
        <main className="mx-auto max-w-6xl px-4 py-6">
            <Link href="/shop" className="text-sm text-lilac underline">
        ← Back to shop
      </Link>

      <ProductView
        name={product.name}
        priceText={naira(product.price_kobo)}
        salePriceText={
          product.sale_price_kobo !== null ? naira(product.sale_price_kobo) : null
        }
        isPreorder={product.is_preorder}
        expectedText={expectedText}
        colors={colors}
        whatsappNumber={setting?.value ?? null}
      />

      {product.description && (
        <p className="mt-8 max-w-2xl whitespace-pre-line text-sm text-purple-100">
          {product.description}
        </p>
      )}

      {isJeans && (
        <div className="mt-8 max-w-2xl">
          <SizeGuide />
        </div>
      )}
    </main>
  );
}