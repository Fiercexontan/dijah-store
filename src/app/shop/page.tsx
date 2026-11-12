import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { relName } from "@/lib/relations";

function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

// The first photo of the first colour is the product's main photo
function mainImagePath(
  colors: { id: string; sort_order: number }[],
  images: { color_id: string | null; storage_path: string; sort_order: number }[]
): string | null {
  const firstColor = [...colors].sort((a, b) => a.sort_order - b.sort_order)[0];
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const img = sorted.find((i) => i.color_id === firstColor?.id) ?? sorted[0];
  return img?.storage_path ?? null;
}

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, price_kobo, sale_price_kobo, is_preorder, categories(name), product_colors(id, sort_order), product_images(color_id, storage_path, sort_order)"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-purple-950 px-4 py-8 text-white">
      <h1 className="text-2xl font-bold tracking-wide">Shop</h1>

      {!products || products.length === 0 ? (
        <p className="mt-8 text-purple-200">New styles are coming soon.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const path = mainImagePath(
              p.product_colors ?? [],
              p.product_images ?? []
            );
            const url = path
              ? supabase.storage.from("product-images").getPublicUrl(path).data
                  .publicUrl
              : null;
            const onSale = p.sale_price_kobo !== null;

            return (
              <li key={p.id}>
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/10">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={p.name}
                        className="aspect-[3/4] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center text-sm text-purple-300">
                        No photo yet
                      </div>
                    )}
                    {p.is_preorder && (
                      <span className="absolute left-2 top-2 rounded-full bg-fuchsia-500/80 px-2 py-1 text-xs">
                        Pre-order
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-purple-200">{relName(p.categories)}</p>
                  <p className="mt-1 text-sm">
                    {onSale ? (
                      <>
                        <span className="font-semibold">
                          {naira(p.sale_price_kobo!)}
                        </span>{" "}
                        <span className="text-xs text-purple-300 line-through">
                          {naira(p.price_kobo)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">{naira(p.price_kobo)}</span>
                    )}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}