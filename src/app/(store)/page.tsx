import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: bannerRows }, { data: setting }] = await Promise.all([
    supabase
      .from("promo_banners")
      .select("id, title, subtitle, image_path, link_url, starts_at, ends_at")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("store_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle(),
  ]);

  const now = Date.now();
  const banners = (bannerRows ?? []).filter(
    (b) =>
      (!b.starts_at || new Date(b.starts_at).getTime() <= now) &&
      (!b.ends_at || new Date(b.ends_at).getTime() >= now)
  );

  const whatsapp = setting?.value
    ? `https://wa.me/${setting.value}?text=${encodeURIComponent(
        "Hello DIJAH FASHION & ACCESSORIES, I'd like to ask about your latest styles."
      )}`
    : null;

  return (
    <main>
      {banners.length > 0 && (
        <section className="mx-auto mt-4 max-w-6xl px-3">
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {banners.map((b) => {
              const url = supabase.storage
                .from("product-images")
                .getPublicUrl(b.image_path).data.publicUrl;
              const slide = (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={b.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="font-heading text-2xl font-bold text-gold sm:text-4xl">
                      {b.title}
                    </p>
                    {b.subtitle && (
                      <p className="mt-1 text-sm text-white/90 sm:text-base">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
              return (
                <li key={b.id} className="w-[88%] shrink-0 snap-center sm:w-[70%]">
                  {b.link_url?.startsWith("/") ? (
                    <Link href={b.link_url}>{slide}</Link>
                  ) : (
                    slide
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="relative mx-auto mt-6 max-w-6xl overflow-hidden px-3">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-lilac/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative grid items-center gap-8 py-8 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-lilac">
              Ibadan · Fashion &amp; Accessories
            </p>
            <h1 className="font-heading mt-4 text-4xl font-bold leading-tight sm:text-6xl">
              Trendy. <span className="text-gold">Classy.</span> Affordable.
            </h1>
            <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
              Clothing, shoes, bags, scarves and accessories for men and women,
              chosen to match your style and your budget.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-2xl bg-gold px-7 py-3 font-semibold text-night shadow-lg"
              >
                Shop now
              </Link>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-2xl px-7 py-3 font-semibold"
                >
                  Chat with us on WhatsApp
                </a>
              )}
            </div>
          </div>

            <div className="glass animate-float rounded-[2rem] p-4">
            <Image
              src="/dijah-logo.png"
              alt="DIJAH Fashion & Accessories"
              width={1349}
              height={898}
              className="w-full rounded-3xl bg-mist"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}