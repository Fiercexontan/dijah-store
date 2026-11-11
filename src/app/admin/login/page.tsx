import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-fuchsia-950 px-5">
      <form
        action={login}
        className="w-full max-w-sm space-y-5 rounded-3xl border border-white/20 bg-white/10 p-7 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide">DIJAH</h1>
          <p className="text-sm text-purple-200">Admin sign in</p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100"
          >
            Incorrect email or password.
          </p>
        )}

        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60"
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950 active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}