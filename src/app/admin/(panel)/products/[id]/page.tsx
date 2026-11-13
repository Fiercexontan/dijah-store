import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { relName } from "@/lib/relations";
import { sizesFor } from "@/lib/sizes";
import {
  setStatus,
  addColor,
  saveStock,
  deleteImage,
  updateProduct,
} from "./actions";
import ImageUploader from "@/components/ImageUploader";

const input =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";
function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

const btn =
  "rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold";

function StatusButton({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-950"
            : btn
        }
      >
        {label}
      </button>
    </form>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, price_kobo, status, is_preorder, description, sale_price_kobo, expected_date, categories(name, size_type), product_colors(id, name, sort_order), product_variants(color_id, size_label, stock_quantity), product_images(id, color_id, storage_path, sort_order)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  const category = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;
  const sizes = sizesFor(category?.size_type);

  const colors = [...(product.product_colors ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const variants = product.product_variants ?? [];
  
    const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const imageUrl = (path: string) =>
    supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  const stockOf = (colorId: string, size: string) =>
    variants.find((v) => v.color_id === colorId && v.size_label === size)
      ?.stock_quantity;
   
  return (
    <>
      <Link href="/admin/products" className="text-sm text-purple-200 underline">
        ← All products
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-purple-200">
        {relName(product.categories)} · {naira(product.price_kobo)}
        {product.is_preorder ? " · Pre-order" : ""}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "color"
            ? "Could not add that colour. Enter a name that this product doesn't already have."
                        : error === "edit"
              ? "Could not save the details. Check the price, and remember a sale price must be lower than the normal price."
              : error === "stock"
              ? "Could not save stock. Use whole numbers, zero or higher."
              : "Could not change the status. Please try again."}
        </p>
      )}

      <section className="mt-6">
        <p className="text-sm text-purple-200">
          Status:{" "}
          <span className="font-semibold capitalize text-white">{product.status}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.status === "draft" && (
            <StatusButton id={product.id} status="active" label="Publish" primary />
          )}
          {product.status === "active" && (
            <StatusButton id={product.id} status="draft" label="Move to draft" />
          )}
          {product.status !== "archived" && (
            <StatusButton id={product.id} status="archived" label="Archive" />
          )}
          {product.status === "archived" && (
            <StatusButton id={product.id} status="draft" label="Restore as draft" />
          )}
        </div>
      </section>
      
            <section className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
        <h2 className="text-lg font-bold">Product details</h2>
        <form action={updateProduct} className="mt-4 max-w-md space-y-4">
          <input type="hidden" name="id" value={product.id} />

          <label className="block text-sm">
            Name
            <input name="name" required defaultValue={product.name} className={input} />
          </label>

          <label className="block text-sm">
            Price (₦)
            <input
              name="price"
              type="number"
              min="1"
              step="any"
              inputMode="decimal"
              required
              defaultValue={product.price_kobo / 100}
              className={input}
            />
          </label>

          <label className="block text-sm">
            Sale price (₦), optional
            <input
              name="sale_price"
              type="number"
              min="1"
              step="any"
              inputMode="decimal"
              defaultValue={
                product.sale_price_kobo === null ? "" : product.sale_price_kobo / 100
              }
              className={input}
            />
            <span className="mt-1 block text-xs text-purple-200">
              Use this for festival discounts. Clear it when the sale ends.
            </span>
          </label>

          <label className="block text-sm">
            Description
            <textarea
              name="description"
              rows={3}
              defaultValue={product.description ?? ""}
              className={input}
            />
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              name="is_preorder"
              type="checkbox"
              defaultChecked={product.is_preorder}
              className="h-5 w-5"
            />
            This is a pre-order item
          </label>

          <label className="block text-sm">
            Expected arrival date (pre-orders only, optional)
            <input
              name="expected_date"
              type="date"
              defaultValue={product.expected_date ?? ""}
              className={input}
            />
          </label>

          <button className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950">
            Save details
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Colours, sizes and stock</h2>

        {colors.length === 0 ? (
          <p className="mt-2 text-sm text-purple-200">
            No colours yet. Add the first colour below.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {colors.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-white/15 bg-white/10 p-4"
              >
                <p className="font-semibold">{c.name}</p>

                                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images
                    .filter((img) => img.color_id === c.id)
                    .map((img) => (
                      <div key={img.id} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl(img.storage_path)}
                          alt={`${product.name} in ${c.name}`}
                          className="aspect-3/4 w-full rounded-lg object-cover"
                        />
                        <form action={deleteImage} className="absolute right-1 top-1">
                          <input type="hidden" name="image_id" value={img.id} />
                          <input type="hidden" name="product_id" value={product.id} />
                          <button
                            aria-label="Delete photo"
                            className="rounded-full bg-black/60 px-2 py-1 text-xs"
                          >
                            ✕
                          </button>
                        </form>
                      </div>
                    ))}
                </div>
                <ImageUploader productId={product.id} colorId={c.id} />

                {sizes.length === 0 ? (
                  <p className="mt-2 text-sm text-purple-200">
                    This category has no size list.
                  </p>
                ) : (
                  <form action={saveStock} className="mt-3">
                    <input type="hidden" name="product_id" value={product.id} />
                    <input type="hidden" name="color_id" value={c.id} />
                    <p className="text-xs text-purple-200">
                      Enter how many you have of each size. Leave a size blank if
                      you don&apos;t sell it. Enter 0 for sold out.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <label key={size} className="text-xs">
                          {size}
                          <input
                            name={`stock_${size}`}
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            placeholder="–"
                            defaultValue={stockOf(c.id, size) ?? ""}
                            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-2 py-2 text-base outline-none focus:border-white/60"
                          />
                        </label>
                      ))}
                    </div>
                    <button className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-950">
                      Save stock
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        <form action={addColor} className="mt-5 flex max-w-md gap-2">
          <input type="hidden" name="product_id" value={product.id} />
          <input
            name="name"
            required
            placeholder="e.g. Black, Wine, Cream"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60"
          />
          <button className="rounded-xl bg-white px-4 font-semibold text-purple-950">
            Add colour
          </button>
        </form>
      </section>
    </>
  );
}