import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";
import {
  updateStatus,
  setDeliveryFee,
  markFeePaid,
  clearAttention,
} from "./actions";

export const dynamic = "force-dynamic";

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

const feeLabel: Record<string, string> = {
  to_be_confirmed: "To be confirmed",
  confirmed: "Confirmed, not yet paid",
  paid: "Paid",
  waived: "No delivery fee",
};

const nextSteps: { status: string; label: string }[] = [
  { status: "processing", label: "Start preparing" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Mark delivered" },
  { status: "returned", label: "Mark returned" },
  { status: "cancelled", label: "Cancel order" },
];

const field =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

export default async function OrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const { data: o } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, customer_name, customer_phone, customer_email, delivery_state, delivery_town, delivery_area, delivery_address, delivery_landmark, delivery_lat, delivery_lng, notes, subtotal_kobo, delivery_fee_kobo, delivery_fee_status, has_preorder, needs_attention, attention_note, created_at, paid_at, order_items(product_name, color_name, size_label, unit_price_kobo, quantity)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!o) notFound();

  const items = o.order_items ?? [];
  const isPaid = o.payment_status === "paid";
  const total = o.subtotal_kobo + (o.delivery_fee_kobo ?? 0);

  const digits = o.customer_phone.replace(/\D/g, "");
  const message = `Hello ${o.customer_name}, this is DIJAH FASHION & ACCESSORIES about your order ${o.order_number}.`;
  const whatsapp = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  const lat = o.delivery_lat === null ? null : Number(o.delivery_lat);
  const lng = o.delivery_lng === null ? null : Number(o.delivery_lng);
  const mapUrl =
    lat !== null && lng !== null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  const steps =
    o.status === "cancelled"
      ? []
      : isPaid
        ? nextSteps.filter((s) => s.status !== o.status)
        : nextSteps.filter((s) => s.status === "cancelled");

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-purple-200 underline">
        ← All orders
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{o.order_number}</h1>
      <p className="mt-1 text-purple-200">
        {statusLabel[o.status] ?? o.status} · {isPaid ? "Paid" : "Not paid"}
        {o.has_preorder ? " · Pre-order" : ""}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error === "fee"
            ? "Enter a delivery fee of zero or more."
            : "That change could not be saved. Please try again."}
        </p>
      )}

      {o.needs_attention && (
        <div className="mt-4 rounded-2xl bg-red-500/25 p-4 text-sm">
          <p className="font-semibold">Needs your attention</p>
          <p className="mt-1">{o.attention_note}</p>
          <form action={clearAttention} className="mt-3">
            <input type="hidden" name="id" value={o.id} />
            <button className="rounded-xl bg-white px-4 py-2 font-semibold text-purple-950">
              Mark as handled
            </button>
          </form>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
        <h2 className="text-lg font-bold">Customer</h2>
        <p className="mt-2">{o.customer_name}</p>
        <p className="text-sm text-purple-200">{o.customer_phone}</p>
        <p className="text-sm text-purple-200">{o.customer_email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-950"
          >
            Message on WhatsApp
          </a>
          <a
            href={`tel:${o.customer_phone}`}
            className="rounded-xl border border-white/30 px-4 py-2 text-sm"
          >
            Call
          </a>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
        <h2 className="text-lg font-bold">Delivery address</h2>
        <p className="mt-2">{o.delivery_address}</p>
        <p className="text-sm text-purple-200">
          {[o.delivery_area, o.delivery_town, o.delivery_state]
            .filter(Boolean)
            .join(", ")}
        </p>
        {o.delivery_landmark && (
          <p className="text-sm text-purple-200">Landmark: {o.delivery_landmark}</p>
        )}
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-xl border border-white/30 px-4 py-2 text-sm"
          >
            Open shared location in Maps
          </a>
        )}
        {o.notes && <p className="mt-3 text-sm">Customer note: {o.notes}</p>}
      </section>

      <section className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
        <h2 className="text-lg font-bold">Items</h2>
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
        <div className="mt-4 space-y-1 border-t border-white/20 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Items total</span>
            <span>{naira(o.subtotal_kobo)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee ({feeLabel[o.delivery_fee_status] ?? o.delivery_fee_status})</span>
            <span>{o.delivery_fee_kobo === null ? "–" : naira(o.delivery_fee_kobo)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{naira(total)}</span>
          </div>
        </div>
      </section>

      {o.status !== "cancelled" && (
        <section className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
          <h2 className="text-lg font-bold">Delivery fee</h2>
          <p className="mt-1 text-xs text-purple-200">
            Agree the fee with the customer on WhatsApp, then enter it here. Enter 0
            for free delivery.
          </p>
          <form action={setDeliveryFee} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={o.id} />
            <input
              name="fee"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              required
              placeholder="₦"
              defaultValue={
                o.delivery_fee_kobo === null ? "" : o.delivery_fee_kobo / 100
              }
              className={field}
            />
            <button className="rounded-xl bg-white px-4 font-semibold text-purple-950">
              Save
            </button>
          </form>
          {o.delivery_fee_status === "confirmed" && (
            <form action={markFeePaid} className="mt-3">
              <input type="hidden" name="id" value={o.id} />
              <button className="rounded-xl border border-white/30 px-4 py-2 text-sm">
                Mark delivery fee as paid
              </button>
            </form>
          )}
        </section>
      )}

      {steps.length > 0 && (
        <section className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4">
          <h2 className="text-lg font-bold">Update status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {steps.map((s) => (
              <form key={s.status} action={updateStatus}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="status" value={s.status} />
                <button
                  className={
                    "rounded-xl px-4 py-2 text-sm font-semibold " +
                    (s.status === "cancelled" || s.status === "returned"
                      ? "border border-white/30"
                      : "bg-white text-purple-950")
                  }
                >
                  {s.label}
                </button>
              </form>
            ))}
          </div>
          {isPaid && (
            <p className="mt-3 text-xs text-purple-200">
              Cancelling or returning a paid order does not refund the customer
              automatically. Make the refund from your Paystack dashboard.
            </p>
          )}
        </section>
      )}
    </>
  );
}