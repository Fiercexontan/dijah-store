import { requireAdmin } from "@/lib/admin";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

const input =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, saved } = await searchParams;

  const { data: rows } = await supabase
    .from("store_settings")
    .select("key, value")
    .in("key", ["whatsapp_number", "contact_email"]);

  const get = (k: string) => rows?.find((r) => r.key === k)?.value ?? "";
  const wa = get("whatsapp_number");
  // Show the familiar Nigerian format, such as 07043542783
  const whatsapp = wa.startsWith("234") ? "0" + wa.slice(3) : wa;

  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-500/25 px-4 py-3 text-sm">
          Saved. Your changes are now live on the website.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "whatsapp"
            ? "Please enter a valid Nigerian number, like 0704 354 2783."
            : error === "email"
              ? "Please enter a valid email address, or leave it empty to hide it."
              : "Could not save. Please try again."}
        </p>
      )}

      <form
        action={saveSettings}
        className="mt-6 max-w-md space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4"
      >
        <label className="block text-sm">
          WhatsApp number for customers
          <input name="whatsapp" type="tel" required defaultValue={whatsapp} className={input} />
          <span className="mt-1 block text-xs text-purple-200">
            Used by the &quot;Chat with us&quot; and &quot;Ask on WhatsApp&quot; buttons.
          </span>
        </label>

        <label className="block text-sm">
          Contact email shown on the Contact page
          <input
            name="email"
            type="email"
            defaultValue={get("contact_email")}
            className={input}
          />
          <span className="mt-1 block text-xs text-purple-200">
            Leave it empty if you don&apos;t want an email shown to customers.
          </span>
        </label>

        <button className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950">
          Save
        </button>
      </form>
    </>
  );
}