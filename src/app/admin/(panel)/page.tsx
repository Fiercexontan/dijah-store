import { requireAdmin } from "@/lib/admin";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-purple-200">
        Categories in the database: {count ?? 0}
      </p>
    </>
  );
}