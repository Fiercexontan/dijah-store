import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("store_settings")
    .select("key, value")
    .in("key", ["whatsapp_number", "contact_email"]);

  const number = rows?.find((r) => r.key === "whatsapp_number")?.value;
  const email = rows?.find((r) => r.key === "contact_email")?.value;

  const whatsapp = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(
        "Hello DIJAH FASHION & ACCESSORIES, I'd like to ask a question."
      )}`
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-lilac">Contact</p>
      <h1 className="font-heading mt-2 text-4xl font-bold sm:text-5xl">
        Let&apos;s <span className="text-gold">chat!</span>
      </h1>
      <p className="mt-4 text-white/80">
        Got a question about a piece, a colour or a size? Wondering about your
        order or a pre-order? Just say hi. WhatsApp is the quickest way to reach
        us, and we&apos;re always happy to help you find what you love.
      </p>

      {whatsapp && (
        <div className="glass mt-6 rounded-2xl p-6">
          <p className="font-heading text-2xl text-gold">Chat with us on WhatsApp</p>
          <p className="mt-2 text-sm text-white/80">
            Send us a message and we&apos;ll get back to you.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-xl bg-mint px-7 py-3 font-semibold text-night"
          >
            Say hello on WhatsApp
          </a>
        </div>
      )}

      {email && (
        <div className="glass mt-4 rounded-2xl p-6">
          <p className="font-heading text-2xl text-gold">Prefer email?</p>
          <p className="mt-2 text-sm text-white/80">
            Drop us a line anytime and we&apos;ll reply as soon as we can.
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-3 inline-block break-all text-lilac underline"
          >
            {email}
          </a>
        </div>
      )}

      <p className="mt-8 font-heading text-xl">Come say hi on social media</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <a
          href="https://www.instagram.com/dijah5555"
          target="_blank"
          rel="noopener noreferrer"
          className="glass rounded-2xl p-6 transition hover:-translate-y-1 motion-reduce:transition-none"
        >
          <p className="font-heading text-xl text-gold">Instagram</p>
          <p className="mt-1 text-sm text-white/80">See our latest styles.</p>
        </a>
        <a
          href="https://www.tiktok.com/@fagbenrokhadijat"
          target="_blank"
          rel="noopener noreferrer"
          className="glass rounded-2xl p-6 transition hover:-translate-y-1 motion-reduce:transition-none"
        >
          <p className="font-heading text-xl text-gold">TikTok</p>
          <p className="mt-1 text-sm text-white/80">Watch and follow along.</p>
        </a>
      </div>

      <p className="mt-8 text-sm text-white/70">Based in Ibadan, Oyo State, Nigeria.</p>
    </main>
  );
}