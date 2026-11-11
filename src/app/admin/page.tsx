import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

export default async function AdminHome() {
  const supabase = await createClient();

  // Must be logged in AND listed as an admin
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) redirect("/admin/login");

  // Proof that the database connection works
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-purple-950 px-6 py-10 text-white">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-2 text-purple-200">
        Connected. Categories in the database: {count ?? 0}
      </p>
      <form action={logout} className="mt-8">
        <button className="rounded-xl bg-white px-5 py-3 font-semibold text-purple-950">
          Sign out
        </button>
      </form>
    </main>
  );
}