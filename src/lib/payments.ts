import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";
import { notifyOwnerOfPaidOrder } from "@/lib/notifications";

export type ConfirmResult =
  | { ok: true; token: string; alreadyProcessed: boolean }
  | {
      ok: false;
      reason: "not_found" | "not_successful" | "mismatch" | "error";
      token?: string;
    };

function one<T>(x: T | T[] | null | undefined): T | null {
  return Array.isArray(x) ? (x[0] ?? null) : (x ?? null);
}

// Safe to call any number of times, from the return page or the webhook
export async function confirmPayment(reference: string): Promise<ConfirmResult> {
  if (typeof reference !== "string" || !/^[A-Za-z0-9._-]{6,100}$/.test(reference)) {
    return { ok: false, reason: "not_found" };
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("reference, amount_kobo, orders(public_token)")
    .eq("reference", reference)
    .maybeSingle();

  if (!payment) return { ok: false, reason: "not_found" };
  const token = one(payment.orders)?.public_token;

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (e) {
    console.error("verify failed", e);
    return { ok: false, reason: "error", token };
  }

  if (tx.status !== "success") {
    if (tx.status === "failed") {
      await admin
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", reference)
        .eq("status", "pending");
    }
    return { ok: false, reason: "not_successful", token };
  }

  if (tx.currency !== "NGN" || tx.amountKobo !== payment.amount_kobo) {
    console.error("payment mismatch", reference, tx.amountKobo, tx.currency);
    return { ok: false, reason: "mismatch", token };
  }

  const { data, error } = await admin.rpc("mark_order_paid", {
    p_reference: reference,
    p_amount_kobo: tx.amountKobo,
  });
  if (error) {
    console.error("mark_order_paid failed", error.message);
    return { ok: false, reason: "error", token };
  }
  
    const orderId = (data as { order_id?: string } | null)?.order_id;
  if (orderId) {
    try {
      await notifyOwnerOfPaidOrder(orderId);
    } catch (e) {
      console.error("owner notification failed", e);
    }
  }

  return {
    ok: true,
    token: token ?? "",
    alreadyProcessed: Boolean((data as { already_processed?: boolean })?.already_processed),
  };
}