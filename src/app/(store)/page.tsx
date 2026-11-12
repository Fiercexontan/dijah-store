import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { mainImagePath, naira } from "@/lib/format";
import { relName } from "@/lib/relations";
import WhyShop from "@/components/WhyShop";

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
  
    const [{ data: catRows }, { data: latest }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "id, name, slug, price_kobo, sale_price_kobo, is_preorder, categories(name), product_colors(id, sort_order), product_images(color_id, storage_path, sort_order)"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const categoryTiles = (catRows ?? []).filter((c) => c.parent_id);
  const latestProducts = latest ?? [];

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

      <section className="mx-auto mt-10 max-w-6xl px-3">
        <h2 className="font-heading text-3xl font-bold">Shop by category</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categoryTiles.map((c) => (
            <li key={c.id}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="glass group flex h-28 items-end justify-between rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/15 motion-reduce:transition-none"
              >
                <span className="font-heading text-lg leading-tight">{c.name}</span>
                <span
                  aria-hidden
                  className="text-gold transition group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {latestProducts.length > 0 && (
        <section className="mx-auto mt-12 max-w-6xl px-3">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-3xl font-bold">New arrivals</h2>
            <Link href="/shop" className="text-sm text-gold underline">
              See all
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {latestProducts.map((p) => {
              const path = mainImagePath(
                p.product_colors ?? [],
                p.product_images ?? []
              );
              return (
                <li key={p.id}>
                  <ProductCard
                    slug={p.slug}
                    name={p.name}
                    categoryName={relName(p.categories)}
                    priceText={naira(p.price_kobo)}
                    salePriceText={
                      p.sale_price_kobo !== null ? naira(p.sale_price_kobo) : null
                    }
                    isPreorder={p.is_preorder}
                    imageUrl={
                      path
                        ? supabase.storage.from("product-images").getPublicUrl(path)
                            .data.publicUrl
                        : null
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <WhyShop whatsapp={whatsapp} />

      {whatsapp && (
        <section className="mx-auto mt-12 max-w-6xl px-3">
          <div className="glass relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />
            <h2 className="font-heading relative text-3xl font-bold sm:text-4xl">
              Can&apos;t decide? Let&apos;s chat.
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/80">
              Tell us what you&apos;re looking for and we&apos;ll help you find the
              perfect piece.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 inline-block rounded-2xl bg-mint px-8 py-3 font-semibold text-night"
            >
              Message us on WhatsApp
            </a>
          </div>
        </section>
      )}
    </main>
  );
}