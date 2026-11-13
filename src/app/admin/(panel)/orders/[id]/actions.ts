"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const OWNER_STATUSES = [
  "awaiting_arrival",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

function refresh(id: string) {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !OWNER_STATUSES.includes(status)) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payment_status")
    .eq("id", id)
    .maybeSingle();
  if (!order || order.status === "cancelled") return;

  // Only paid orders move through fulfilment. An unpaid order can only be cancelled.
  if (order.payment_status !== "paid" && status !== "cancelled") return;

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`/admin/orders/${id}?error=status`);

  // Cancelling an unpaid order frees the items held for it
  if (status === "cancelled" && order.payment_status !== "paid") {
    await createAdminClient()
      .from("stock_reservations")
      .update({ status: "released" })
      .eq("order_id", id)
      .eq("status", "active");
  }

  refresh(id);
}

export async function setDeliveryFee(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fee = Number(formData.get("fee"));
  if (!id) return;
  if (!Number.isFinite(fee) || fee < 0 || fee > 1_000_000) {
    redirect(`/admin/orders/${id}?error=fee`);
  }

  const { error } = await supabase
    .from("orders")
    .update({
      delivery_fee_kobo: Math.round(fee * 100),
      delivery_fee_status: fee === 0 ? "waived" : "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) redirect(`/admin/orders/${id}?error=fee`);

  refresh(id);
}

export async function markFeePaid(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("orders")
    .update({ delivery_fee_status: "paid", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("delivery_fee_status", "confirmed");

  refresh(id);
}

export async function clearAttention(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("orders")
    .update({ needs_attention: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  refresh(id);
}