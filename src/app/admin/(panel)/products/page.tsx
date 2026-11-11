import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_kobo, status, is_preorder, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-950"
        >
          Add product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-8 text-purple-200">
          No products yet. Tap “Add product” to create the first one.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-white/15 bg-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-purple-200">
                    {p.categories?.name} · {naira(p.price_kobo)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="rounded-full bg-white/15 px-2 py-1 capitalize">
                    {p.status}
                  </span>
                  {p.is_preorder && (
                    <span className="rounded-full bg-fuchsia-400/30 px-2 py-1">
                      Pre-order
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}