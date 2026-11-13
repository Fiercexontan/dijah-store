import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { naira } from "@/lib/format";

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

const filters: { key: string; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "attention", label: "Needs attention" },
  { key: "unpaid", label: "Unpaid" },
  { key: "done", label: "Completed" },
  { key: "all", label: "All" },
];

const TODO = ["paid", "awaiting_arrival", "processing", "out_for_delivery"];
const DONE = ["delivered", "cancelled", "returned"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { filter } = await searchParams;
  const active = filters.some((f) => f.key === filter) ? filter! : "todo";

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, customer_name, subtotal_kobo, has_preorder, needs_attention, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (active === "todo") query = query.in("status", TODO);
  else if (active === "attention") query = query.eq("needs_attention", true);
  else if (active === "unpaid") query = query.eq("status", "pending_payment");
  else if (active === "done") query = query.in("status", DONE);

  const { data: orders } = await query;

  return (
    <>
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/orders?filter=${f.key}`}
            className={
              "rounded-xl px-4 py-2 " +
              (active === f.key ? "bg-white text-purple-950" : "bg-white/10")
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-8 text-purple-200">No orders here.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="block rounded-2xl border border-white/15 bg-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {o.order_number} · {o.customer_name}
                    </p>
                    <p className="text-sm text-purple-200">
                      {new Date(o.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Africa/Lagos",
                      })}{" "}
                      · {naira(o.subtotal_kobo)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="rounded-full bg-white/15 px-2 py-1">
                      {statusLabel[o.status] ?? o.status}
                    </span>
                    {o.has_preorder && (
                      <span className="rounded-full bg-fuchsia-400/30 px-2 py-1">
                        Pre-order
                      </span>
                    )}
                    {o.needs_attention && (
                      <span className="rounded-full bg-red-500/40 px-2 py-1">
                        Needs attention
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}