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

type Params = {
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
  preorder?: string;
};

const field =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base outline-none focus:border-white/60";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("is_active", true)
    .order("sort_order");
  const categories = cats ?? [];
  const parents = categories.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);
  const selected = categories.find((c) => c.slug === sp.category);

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price_kobo, sale_price_kobo, is_preorder, created_at, categories(name), product_colors(id, sort_order), product_images(color_id, storage_path, sort_order)"
    )
    .eq("status", "active");

  if (selected) {
    // A main category such as Clothing includes everything inside it
    const ids = [selected.id, ...childrenOf(selected.id).map((c) => c.id)];
    query = query.in("category_id", ids);
  }
  if (sp.preorder === "1") query = query.eq("is_preorder", true);

  const { data } = await query;
  let products = data ?? [];

  // Price filters use the price the customer would actually pay
  const effective = (p: { sale_price_kobo: number | null; price_kobo: number }) =>
    p.sale_price_kobo ?? p.price_kobo;

  const min = Number(sp.min);
  const max = Number(sp.max);
  if (sp.min && Number.isFinite(min) && min > 0) {
    products = products.filter((p) => effective(p) >= min * 100);
  }
  if (sp.max && Number.isFinite(max) && max > 0) {
    products = products.filter((p) => effective(p) <= max * 100);
  }

  products = [...products].sort((a, b) => {
    if (sp.sort === "price_asc") return effective(a) - effective(b);
    if (sp.sort === "price_desc") return effective(b) - effective(a);
    return b.created_at.localeCompare(a.created_at); // newest first
  });

  const activeCount = [
    selected,
    sp.min && min > 0,
    sp.max && max > 0,
    sp.preorder === "1",
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-purple-950 px-4 py-8 text-white">
      <h1 className="text-2xl font-bold tracking-wide">Shop</h1>

      <details
        open={activeCount > 0}
        className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4"
      >
        <summary className="cursor-pointer font-semibold">
          Filters &amp; sorting{activeCount > 0 ? ` (${activeCount})` : ""}
        </summary>

        <form method="get" action="/shop" className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Category
            <select name="category" defaultValue={selected?.slug ?? ""} className={field}>
              <option value="">All categories</option>
              {parents.map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.slug} className="text-black">
                    All {parent.name}
                  </option>
                  {childrenOf(parent.id).map((child) => (
                    <option key={child.id} value={child.slug} className="text-black">
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Sort by
            <select name="sort" defaultValue={sp.sort ?? ""} className={field}>
              <option value="" className="text-black">Newest</option>
              <option value="price_asc" className="text-black">Price: low to high</option>
              <option value="price_desc" className="text-black">Price: high to low</option>
            </select>
          </label>

          <label className="block text-sm">
            Lowest price (₦)
            <input
              name="min"
              type="number"
              min="0"
              inputMode="numeric"
              defaultValue={sp.min ?? ""}
              className={field}
            />
          </label>

          <label className="block text-sm">
            Highest price (₦)
            <input
              name="max"
              type="number"
              min="0"
              inputMode="numeric"
              defaultValue={sp.max ?? ""}
              className={field}
            />
          </label>

          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              name="preorder"
              type="checkbox"
              value="1"
              defaultChecked={sp.preorder === "1"}
              className="h-5 w-5"
            />
            Pre-order items only
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button className="rounded-xl bg-white px-5 py-2 font-semibold text-purple-950">
              Apply
            </button>
            <Link
              href="/shop"
              className="rounded-xl border border-white/30 px-5 py-2 text-sm leading-[2.2]"
            >
              Clear all
            </Link>
          </div>
        </form>
      </details>

      {products.length === 0 ? (
        <p className="mt-8 text-purple-200">
          {activeCount > 0 ? (
            <>
              No products match these filters.{" "}
              <Link href="/shop" className="underline">
                Clear filters
              </Link>
            </>
          ) : (
            "New styles are coming soon."
          )}
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const path = mainImagePath(p.product_colors ?? [], p.product_images ?? []);
            const url = path
              ? supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl
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
                        <span className="font-semibold">{naira(p.sale_price_kobo!)}</span>{" "}
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