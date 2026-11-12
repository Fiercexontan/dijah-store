import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { naira } from "@/lib/format";

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

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs uppercase tracking-[0.25em] text-lilac">Your order</p>
      <h1 className="font-heading mt-1 text-4xl font-bold">{order.order_number}</h1>
      <p className="mt-2 text-gold">
        {statusLabel[order.status] ?? order.status}
      </p>

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

      {order.payment_status === "unpaid" && (
        <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80">
          Your items are held for 15 minutes while you complete payment. Online
          payment is the next step we&apos;re connecting.
        </p>
      )}
    </main>
  );
}