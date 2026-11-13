import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About us" };

const collections = [
  {
    title: "Clothing",
    text: "Basic tops, round-neck tops, crop tops, hoodies, joggers, jeans, trousers, skirts and gowns in different styles and designs.",
  },
  {
    title: "Footwear",
    text: "Sneakers, sandals, heels, flats and other fashionable footwear.",
  },
  {
    title: "Bags",
    text: "Crossbody bags, tote bags, shoulder bags, handbags and backpacks.",
  },
  {
    title: "Scarves",
    text: "Jersey, vintage, chiffon, satin, silk, cotton, pashmina, printed and square scarves.",
  },
  {
    title: "Caps & accessories",
    text: "Face caps and other fashion accessories.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-lilac">About us</p>
      <h1 className="font-heading mt-2 text-4xl font-bold sm:text-5xl">
        Trendy. <span className="text-gold">Classy.</span> Affordable.
      </h1>

      <div className="glass mt-6 space-y-4 rounded-2xl p-6 text-white/90">
        <p>
          DIJAH FASHION &amp; ACCESSORIES is a fashion business that offers a wide
          variety of trendy, classy and affordable clothing, shoes, bags and
          fashion accessories for both men and women.
        </p>
        <p>
          Our goal is to make fashionable and stylish items accessible to
          everyone at affordable prices while offering comfort, quality and value
          for money.
        </p>
        <p>We&apos;re based in Ibadan, Oyo State.</p>
      </div>

      <h2 className="font-heading mt-10 text-3xl font-bold">What we offer</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {collections.map((c) => (
          <li key={c.title} className="glass rounded-2xl p-5">
            <p className="font-heading text-xl text-gold">{c.title}</p>
            <p className="mt-2 text-sm text-white/80">{c.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-2xl bg-gold px-7 py-3 font-semibold text-night"
        >
          Shop now
        </Link>
        <Link href="/contact" className="glass rounded-2xl px-7 py-3 font-semibold">
          Get in touch
        </Link>
      </div>
    </main>
  );
}