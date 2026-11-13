import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Frequently asked questions" };

const faqs: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "It's easy! Browse the shop, pick your colour and size, add your favourites to the cart and head to checkout. Tell us where to deliver, pay online, and you're done. You don't even need an account.",
  },
  {
    q: "How do I pay?",
    a: "You pay for your items in full, online, securely through Paystack. Once you place your order, we hold your items for 15 minutes so you can pay without any rush.",
  },
  {
    q: "Where do you deliver?",
    a: "We deliver from Ibadan to customers across Ibadan and other locations within Oyo State. Not in Oyo State? Message us on WhatsApp and we'll see what we can do.",
  },
  {
    q: "How much is delivery?",
    a: "The delivery fee isn't part of your checkout total. After you order, we'll chat with you on WhatsApp, tell you the fee and agree it together.",
  },
  {
    q: "How long will my delivery take?",
    a: "It depends on the transportation between us and where you are, so there's no fixed time. We'll talk it through with you on WhatsApp so you know what to expect.",
  },
  {
    q: "What is a pre-order?",
    a: "Found something in our upcoming collection that you love? A pre-order lets you secure it by paying upfront. We'll keep you updated on WhatsApp and let you know the moment your item arrives.",
  },
  {
    q: "The colour or size I want isn't available. What now?",
    a: "No problem, just ask! Tap the WhatsApp button on the product page and we'll confirm together whether we can get it for you.",
  },
  {
    q: "Can I return something?",
    a: "Yes, if the issue is caused by us. Within 7 days of receiving your order, you can return an item if we sent the wrong one or it has a fault attributable to us. We can't accept returns for a change of mind, or for a wrong size or colour selected at checkout, so please double-check your choices before you pay. Our full return policy has all the details.",
  },
  {
    q: "How does a return work?",
    a: "We'll arrange a meeting place with you on WhatsApp, and you take care of your own transport to get there. If the mistake is ours, you can choose a refund or a replacement.",
  },
  {
    q: "How can I reach you?",
    a: "Message us on WhatsApp, we love hearing from you! You can also find us on Instagram and TikTok, or visit our contact page for more ways to reach us.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-lilac">FAQ</p>
      <h1 className="font-heading mt-2 text-4xl font-bold sm:text-5xl">
        Got questions? <span className="text-gold">We&apos;ve got answers.</span>
      </h1>

      <ul className="mt-6 space-y-3">
        {faqs.map((f) => (
          <li key={f.q}>
            <details className="glass group rounded-2xl p-5">
              <summary className="cursor-pointer list-none font-semibold">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span aria-hidden className="text-gold transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-white/80">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-white/80">
        Want the full details? Read our{" "}
        <Link href="/returns" className="text-gold underline">
          return policy
        </Link>
        , or{" "}
        <Link href="/contact" className="text-gold underline">
          get in touch
        </Link>
        . We&apos;re happy to help.
      </p>
    </main>
  );
}