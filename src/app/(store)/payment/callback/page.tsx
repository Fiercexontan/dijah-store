import Link from "next/link";
import { redirect } from "next/navigation";
import { confirmPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref ?? "";
  const result = await confirmPayment(reference);

  if (result.ok) redirect(`/order/${result.token}?paid=1`);
  if (result.token) redirect(`/order/${result.token}?payment=${result.reason}`);

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="font-heading text-3xl font-bold">We couldn&apos;t find that payment</h1>
      <p className="mt-3 text-white/70">
        If you were charged, please message us on WhatsApp and we&apos;ll sort it out.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-night"
      >
        Back to shop
      </Link>
    </main>
  );
}