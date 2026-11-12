import Link from "next/link";

type Card = {
  label: string;
  title: string;
  paragraphs: string[];
  link?: { href: string; text: string };
};

const cards: Card[] = [
  {
    label: "Customer Support",
    title: "We're Here to Help",
    paragraphs: [
      "Have questions about an item, available colours, sizes, or placing an order? Send us a message on WhatsApp, and we'll be happy to assist you.",
    ],
  },
  {
    label: "Return Policy",
    title: "7-Day Returns for Our Mistakes",
    paragraphs: [
      "We accept returns within 7 days of receiving your order if the issue is caused by DIJAH, such as receiving the wrong item or an item with a fault attributable to us.",
      "The item must be returned in the condition it was received, without additional damage or alteration. Returns must be completed within the 7-day period. Unfortunately, we cannot accept returns after this period.",
      "Please note that we do not accept returns simply because a customer changes their mind, no longer wants an item, or selects the wrong size or colour when placing an order. Please check your selections carefully before confirming your purchase.",
    ],
    link: { href: "/returns", text: "Read the full return policy →" },
  },
  {
    label: "Pre-Orders",
    title: "Reserve Your Favourite Pieces",
    paragraphs: [
      "Found something you love in our upcoming collection? You can secure it through a pre-order by making payment upfront. We'll keep you updated on WhatsApp and notify you when your item arrives.",
    ],
  },
  {
    label: "Delivery",
    title: "We Deliver to You",
    paragraphs: [
      "Our deliveries are handled from Ibadan. We deliver across Ibadan and other locations within Oyo State. Your delivery fee will be communicated and confirmed with you on WhatsApp.",
    ],
  },
];

export default function WhyShop({ whatsapp }: { whatsapp: string | null }) {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-3">
      <h2 className="font-heading text-3xl font-bold">Why shop with DIJAH</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {cards.map((c) => (
          <li key={c.label} className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-lilac">
              {c.label}
            </p>
            <h3 className="font-heading mt-2 text-2xl text-gold">{c.title}</h3>
            <div className="mt-3 space-y-3 text-sm text-white/80">
              {c.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {c.link && (
              <Link href={c.link.href} className="mt-4 inline-block text-sm text-gold underline">
                {c.link.text}
              </Link>
            )}
            {c.label === "Customer Support" && whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-xl bg-mint px-5 py-2 text-sm font-semibold text-night"
              >
                Message us on WhatsApp
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}