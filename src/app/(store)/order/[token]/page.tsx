import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { naira } from "@/lib/format";
import PayButton from "@/components/PayButton";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  awaiting_arrival: "Pre-order, awaiting arrival",
  processing: "Being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const paymentNotes: Record<string, string> = {
  not_successful:
    "Your payment wasn't completed, so you haven't been charged. You can try again below while your items are held.",
  mismatch:
    "We couldn't match your payment to this order. Please message us on WhatsApp and we'll sort it out.",
  error:
    "We couldn't confirm your payment yet. Please don't pay again. Refresh this page in a minute, and message us on WhatsApp if it still shows unpaid.",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; payment?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f]{32}$/.test(token)) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "order_number, status, payment_status, customer_name, delivery_town, delivery_area, delivery_address, subtotal_kobo, delivery_fee_kobo, has_preorder, order_items(product_name, color_name, size_label, unit_price_kobo, quantity)"
    )
    .eq("public_token", token)
    .maybeSingle();

  if (!order) notFound();
  const items = order.order_items ?? [];
    const { data: wa } = await admin
    .from("store_settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();
  const chat = wa?.value
    ? `https://wa.me/${wa.value}?text=${encodeURIComponent(
        `Hello DIJAH FASHION & ACCESSORIES, I've just paid for order ${order.order_number}. Please confirm you received it.`
      )}`
    : null;
  const isPaid = order.payment_status === "paid";
  const canPay = order.payment_status !== "paid" && order.status === "pending_payment";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {isPaid && <ClearCart />}

      <p className="text-xs uppercase tracking-[0.25em] text-lilac">Your order</p>
      <h1 className="font-heading mt-1 text-4xl font-bold">{order.order_number}</h1>
      <p className="mt-2 text-gold">{statusLabel[order.status] ?? order.status}</p>

      {isPaid && (
        <div className="mt-5 rounded-2xl bg-mint/15 px-5 py-4 text-sm text-mint">
          <p className="font-semibold">Payment received. Thank you!</p>
          <p className="mt-1 text-white/80">
            {order.has_preorder
              ? "We'll keep you updated on WhatsApp and let you know when your pre-order arrives. "
              : ""}
            We&apos;ll confirm your delivery fee and arrange delivery with you on WhatsApp.
          </p>
        </div>
      )}
      
            {isPaid && chat && (
        <a
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-mint px-6 py-3 font-semibold text-night"
        >
          Message us about this order on WhatsApp
        </a>
      )}
      
      {!isPaid && sp.payment && paymentNotes[sp.payment] && (
        <p className="mt-5 rounded-2xl bg-rose/15 px-5 py-4 text-sm text-rose">
          {paymentNotes[sp.payment]}
        </p>
      )}

      <div className="glass mt-6 rounded-2xl p-5">
        <p className="font-heading text-xl">Items</p>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3">
              <span>
                {i.product_name} · {i.color_name} · {i.size_label} × {i.quantity}
              </span>
              <span className="shrink-0">{naira(i.unit_price_kobo * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-white/20 pt-4">
          <span className="text-white/70">Items total</span>
          <span className="font-semibold">{naira(order.subtotal_kobo)}</span>
        </div>
        <p className="mt-2 text-xs text-white/60">
          {order.delivery_fee_kobo === null
            ? "Delivery fee to be confirmed with you on WhatsApp."
            : `Delivery fee: ${naira(order.delivery_fee_kobo)}`}
        </p>
      </div>

      <div className="glass mt-4 rounded-2xl p-5 text-sm">
        <p className="font-heading text-xl">Delivery to</p>
        <p className="mt-2">{order.customer_name}</p>
        <p className="text-white/80">
          {order.delivery_address}
          {order.delivery_area ? `, ${order.delivery_area}` : ""}, {order.delivery_town}
        </p>
      </div>

      {canPay && (
        <div className="glass mt-4 rounded-2xl p-5">
          <p className="text-sm text-white/80">
            Your items are held for 15 minutes while you complete payment.
          </p>
          <div className="mt-4">
            <PayButton token={token} amountText={naira(order.subtotal_kobo)} />
          </div>
        </div>
      )}
    </main>
  );
}