import { requireAdmin } from "@/lib/admin";
import { createProduct } from "../actions";

const field =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .eq("is_active", true)
    .order("sort_order");

  const parents = (categories ?? []).filter((c) => !c.parent_id);
  const childrenOf = (id: string) =>
    (categories ?? []).filter((c) => c.parent_id === id);

  return (
    <>
      <h1 className="text-2xl font-bold">Add product</h1>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "invalid"
            ? "Please fill in the name, category and a price above zero."
            : "Something went wrong saving the product. Please try again."}
        </p>
      )}

      <form action={createProduct} className="mt-6 max-w-md space-y-5">
        <label className="block text-sm">
          Product name
          <input name="name" required className={field} />
        </label>

        <label className="block text-sm">
          Category
          <select name="category_id" required defaultValue="" className={field}>
            <option value="" disabled>
              Choose a category
            </option>
            {parents.map((parent) => (
              <optgroup key={parent.id} label={parent.name}>
                {childrenOf(parent.id).map((child) => (
                  <option key={child.id} value={child.id} className="text-black">
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Price (₦)
          <input
            name="price"
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            required
            className={field}
          />
        </label>

        <label className="block text-sm">
          Description (optional)
          <textarea name="description" rows={3} className={field} />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input name="is_preorder" type="checkbox" className="h-5 w-5" />
          This is a pre-order item
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950"
        >
          Save product
        </button>
      </form>
    </>
  );
}