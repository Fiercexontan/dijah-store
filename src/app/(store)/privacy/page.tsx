import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy policy" };

const sections: { title: string; body: string[] }[] = [
  {
    title: "What we collect",
    body: [
      "When you place an order, we collect your name, phone number, email address and delivery details (your town, area, address and nearest landmark), along with the items you ordered and any note you add.",
      "If you choose to share your current location at checkout, we also receive it. That is completely optional.",
      "We never see or store your card or bank details. Payments are handled by Paystack.",
    ],
  },
  {
    title: "Why we need it",
    body: [
      "We use your details to process your order, arrange delivery, contact you about it (usually on WhatsApp), and send you order updates by email.",
    ],
  },
  {
    title: "Who handles your information",
    body: [
      "We rely on a few trusted services to run the shop: Paystack to process payments, Supabase to store our data securely, Resend to send order emails, and our website hosting provider. They only handle your information to provide these services.",
      "We don't sell your information.",
    ],
  },
  {
    title: "Your cart and cookies",
    body: [
      "Your shopping cart is saved on your own device so it's still there when you come back. At the moment, we don't use advertising or tracking tools on this website.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Just message us and we'll help. We may need to keep records of past orders.",
    ],
  },
  {
    title: "Questions",
    body: ["If you have any questions about your privacy, get in touch. We're happy to explain."],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-lilac">Privacy</p>
      <h1 className="font-heading mt-2 text-4xl font-bold sm:text-5xl">
        Your privacy matters to us
      </h1>
      <p className="mt-3 text-white/80">
        Here&apos;s a plain-English explanation of what we do with your
        information when you shop with DIJAH FASHION &amp; ACCESSORIES.
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
        Last updated: November 2026. Need to reach us?{" "}
        <Link href="/contact" className="text-gold underline">
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}