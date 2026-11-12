import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Return Policy" };

const rows: [string, boolean][] = [
  ["DIJAH sends the wrong item", true],
  ["An item has a fault attributable to DIJAH", true],
  ["Customer changes their mind", false],
  ["Customer no longer wants the item", false],
  ["Customer selects the wrong size or colour", false],
  ["Customer requests a return after 7 days", false],
];

export default async function ReturnsPage() {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  const whatsapp = setting?.value
    ? `https://wa.me/${setting.value}?text=${encodeURIComponent(
        "Hello DIJAH FASHION & ACCESSORIES, I have a question about your return policy."
      )}`
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-lilac underline">
        ← Home
      </Link>

      <h1 className="font-heading mt-4 text-4xl font-bold">Return Policy</h1>
      <p className="mt-2 text-gold">7-Day Returns for Our Mistakes</p>

      <div className="glass mt-6 space-y-5 rounded-2xl p-6 text-white/90">
        <section>
          <h2 className="font-heading text-xl text-gold">When we accept returns</h2>
          <p className="mt-2">
            We accept returns within 7 days of receiving your order if the issue
            is caused by DIJAH, such as receiving the wrong item or an item with a
            fault attributable to us.
          </p>
        </section>
        
                <section>
          <h2 className="font-heading text-xl text-gold">Refund or replacement</h2>
          <p className="mt-2">
            If the mistake is ours, you can choose a refund or a replacement. In
            both cases the item must be returned within 7 days and in good
            condition. We&apos;ll agree the details with you on WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-gold">How a return works</h2>
          <p className="mt-2">
            Returns are done by meeting at a location we agree together. Message
            us on WhatsApp as soon as you notice a problem, and we&apos;ll
            arrange it with you. You are responsible for your own transport to
            the agreed meeting place.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-gold">Condition of the item</h2>
          <p className="mt-2">
            The item must be returned in the condition it was received, without
            additional damage or alteration.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-gold">Time limit</h2>
          <p className="mt-2">
            Returns must be completed within the 7-day period. Unfortunately, we
            cannot accept returns after this period.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-gold">What we cannot accept</h2>
          <p className="mt-2">
            We do not accept returns simply because a customer changes their mind,
            no longer wants an item, or selects the wrong size or colour when
            placing an order. Please check your selections carefully before
            confirming your purchase.
          </p>
        </section>
      </div>

      <h2 className="font-heading mt-10 text-2xl font-bold">Quick guide</h2>
      <div className="glass mt-4 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[22rem] text-left text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-4 py-3 font-semibold">Situation</th>
              <th className="px-4 py-3 font-semibold">Return eligibility</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([situation, eligible]) => (
              <tr key={situation} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3">{situation}</td>
                <td
                  className={
                    "px-4 py-3 font-semibold " +
                    (eligible ? "text-mint" : "text-rose")
                  }
                >
                  {eligible ? "Eligible within 7 days" : "Not eligible"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-2xl bg-mint px-7 py-3 font-semibold text-night"
        >
          Questions? Message us on WhatsApp
        </a>
      )}
    </main>
  );
}