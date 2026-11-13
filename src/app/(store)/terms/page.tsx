import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of service" };

const sections: { title: string; body: string[] }[] = [
  {
    title: "Who we are",
    body: [
      "This website is run by DIJAH FASHION & ACCESSORIES, a fashion business based in Ibadan, Oyo State, Nigeria. By placing an order, you agree to these terms.",
    ],
  },
  {
    title: "Prices and payment",
    body: [
      "All prices are in Nigerian naira (₦). You pay for your items in full, online, at checkout, through Paystack.",
      "After you place an order, we hold your items for 15 minutes so you can complete payment. Your order is confirmed once we receive your payment.",
      "The delivery fee is not included in your checkout total. We confirm it with you on WhatsApp.",
    ],
  },
  {
    title: "Availability",
    body: [
      "Our stock is limited. If an item you've paid for turns out to be unavailable, we'll contact you on WhatsApp to sort it out.",
    ],
  },
  {
    title: "Pre-orders",
    body: [
      "A pre-order secures an upcoming item. You pay upfront, and we keep you updated on WhatsApp and let you know when your item arrives.",
    ],
  },
  {
    title: "Delivery",
    body: [
      "Our deliveries are handled from Ibadan. We deliver across Ibadan and other locations within Oyo State. Delivery time depends on the transportation between us and your location, so there is no fixed time. We'll agree the details with you on WhatsApp.",
    ],
  },
  {
    title: "Returns",
    body: [
      "Our return policy is part of these terms. Please read it before you order: returns are accepted within 7 days only when the issue is caused by DIJAH, and not because of a change of mind or a wrong size or colour selected at checkout.",
    ],
  },
  {
    title: "Questions",
    body: ["Not sure about something? Message us on WhatsApp before you order. We're happy to help."],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-lilac">Terms</p>
      <h1 className="font-heading mt-2 text-4xl font-bold sm:text-5xl">
        Terms of service
      </h1>
      <p className="mt-3 text-white/80">
        The simple rules for shopping with us, so everyone knows what to expect.
      </p>

      <div className="glass mt-6 space-y-6 rounded-2xl p-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-xl text-gold">{s.title}</h2>
            <div className="mt-2 space-y-3 text-sm text-white/85">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm text-white/70">
        Last updated: November 2026. Read our{" "}
        <Link href="/returns" className="text-gold underline">
          full return policy
        </Link>{" "}
        or our{" "}
        <Link href="/privacy" className="text-gold underline">
          privacy policy
        </Link>
        .
      </p>
    </main>
  );
}