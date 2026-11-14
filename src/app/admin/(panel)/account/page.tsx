import { requireAdmin } from "@/lib/admin";
import { changePassword } from "./actions";

export const dynamic = "force-dynamic";

const input =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

const messages: Record<string, string> = {
  short: "Your new password must be at least 10 characters.",
  match: "The two new passwords don't match.",
  same: "Your new password must be different from the current one.",
  current: "Your current password isn't correct.",
  save: "We couldn't change the password. Please try again.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, saved } = await searchParams;
  const { data } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="text-2xl font-bold">My account</h1>
      <p className="mt-1 text-sm text-purple-200">Signed in as {data.user?.email}</p>

      {saved && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-500/25 px-4 py-3 text-sm">
          Your password has been changed.
        </p>
      )}
      {error && messages[error] && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {messages[error]}
        </p>
      )}

      <form
        action={changePassword}
        className="mt-6 max-w-md space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4"
      >
        <h2 className="text-lg font-bold">Change password</h2>

        <label className="block text-sm">
          Current password
          <input name="current" type="password" required autoComplete="current-password" className={input} />
        </label>

        <label className="block text-sm">
          New password (at least 10 characters)
          <input name="next" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </label>

        <label className="block text-sm">
          Type the new password again
          <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </label>

        <button className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950">
          Change password
        </button>
      </form>
    </>
  );
}