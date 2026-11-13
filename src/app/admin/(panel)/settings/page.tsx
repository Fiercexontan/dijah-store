import { requireAdmin } from "@/lib/admin";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, saved } = await searchParams;

  const { data: setting } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  // Show the familiar Nigerian format, such as 0704 354 2783
  const current = setting?.value?.startsWith("234")
    ? "0" + setting.value.slice(3)
    : (setting?.value ?? "");

  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-500/25 px-4 py-3 text-sm">
          Saved. The new number is now live on the website.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "whatsapp"
            ? "Please enter a valid Nigerian number, like 0704 354 2783."
            : "Could not save. Please try again."}
        </p>
      )}

      <form
        action={saveSettings}
        className="mt-6 max-w-md space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4"
      >
        <label className="block text-sm">
          WhatsApp number for customers
          <input
            name="whatsapp"
            type="tel"
            required
            defaultValue={current}
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60"
          />
          <span className="mt-1 block text-xs text-purple-200">
            Customers reach you on this number from the &quot;Chat with us&quot; and
            &quot;Ask on WhatsApp&quot; buttons.
          </span>
        </label>
        <button className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950">
          Save
        </button>
      </form>
    </>
  );
}