import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { setStatus, addColor } from "./actions";

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
          primary ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-950" : btn
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
      "id, name, price_kobo, status, is_preorder, description, categories(name), product_colors(id, name, sort_order)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  const colors = [...(product.product_colors ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <>
      <Link href="/admin/products" className="text-sm text-purple-200 underline">
        ← All products
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-purple-200">
        {product.categories?.name} · {naira(product.price_kobo)}
        {product.is_preorder ? " · Pre-order" : ""}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "color"
            ? "Could not add that colour. Enter a name that this product doesn't already have."
            : "Could not change the status. Please try again."}
        </p>
      )}

      <section className="mt-6">
        <p className="text-sm text-purple-200">
          Status: <span className="font-semibold capitalize text-white">{product.status}</span>
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

      <section className="mt-10">
        <h2 className="text-lg font-bold">Colours</h2>

        {colors.length === 0 ? (
          <p className="mt-2 text-sm text-purple-200">
            No colours yet. Add the first colour below.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {colors.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}

        <form action={addColor} className="mt-4 flex max-w-md gap-2">
          <input type="hidden" name="product_id" value={product.id} />
          <input
            name="name"
            required
            placeholder="e.g. Black, Wine, Cream"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60"
          />
          <button className="rounded-xl bg-white px-4 font-semibold text-purple-950">
            Add
          </button>
        </form>
      </section>
    </>
  );
}