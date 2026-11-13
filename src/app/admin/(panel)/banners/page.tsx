import { requireAdmin } from "@/lib/admin";
import BannerForm from "@/components/BannerForm";
import { toggleBanner, deleteBanner } from "./actions";

export const dynamic = "force-dynamic";

function when(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        dateStyle: "medium",
        timeZone: "Africa/Lagos",
      })
    : null;
}

export default async function BannersPage() {
  const { supabase } = await requireAdmin();

  const { data: banners } = await supabase
    .from("promo_banners")
    .select("id, title, subtitle, image_path, link_url, is_active, starts_at, ends_at")
    .order("sort_order")
    .order("created_at");

  const now = Date.now();

  return (
    <>
      <h1 className="text-2xl font-bold">Homepage banners</h1>
      <p className="mt-1 text-sm text-purple-200">
        These slide across the top of the homepage. Set dates, and a promo shows and
        hides itself automatically.
      </p>

      {!banners || banners.length === 0 ? (
        <p className="mt-6 text-purple-200">No banners yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {banners.map((b) => {
            const start = b.starts_at ? new Date(b.starts_at).getTime() : null;
            const end = b.ends_at ? new Date(b.ends_at).getTime() : null;
            const status = !b.is_active
              ? "Off"
              : end !== null && end < now
                ? "Ended"
                : start !== null && start > now
                  ? "Scheduled"
                  : "Live";
            const url = supabase.storage
              .from("product-images")
              .getPublicUrl(b.image_path).data.publicUrl;

            return (
              <li
                key={b.id}
                className="rounded-2xl border border-white/15 bg-white/10 p-4"
              >
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-32 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{b.title}</p>
                    {b.subtitle && (
                      <p className="text-sm text-purple-200">{b.subtitle}</p>
                    )}
                    <p className="mt-1 text-xs text-purple-200">
                      {when(b.starts_at) ? `From ${when(b.starts_at)} ` : ""}
                      {when(b.ends_at) ? `Until ${when(b.ends_at)}` : ""}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-white/15 px-2 py-1 text-xs">
                      {status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={toggleBanner}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="on" value={b.is_active ? "0" : "1"} />
                    <button className="rounded-xl border border-white/30 px-4 py-2 text-sm">
                      {b.is_active ? "Turn off" : "Turn on"}
                    </button>
                  </form>

                  <details>
                    <summary className="cursor-pointer rounded-xl border border-white/30 px-4 py-2 text-sm">
                      Delete
                    </summary>
                    <form action={deleteBanner} className="mt-2">
                      <input type="hidden" name="id" value={b.id} />
                      <button className="rounded-xl bg-red-500/40 px-4 py-2 text-sm font-semibold">
                        Yes, delete this banner
                      </button>
                    </form>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <BannerForm />
    </>
  );
}