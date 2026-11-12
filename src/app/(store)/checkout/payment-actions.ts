"use server";

import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";

export type StartPaymentResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function startPayment(token: string): Promise<StartPaymentResult> {
  if (typeof token !== "string" || !/^[0-9a-f]{32}$/.test(token)) {
    return { ok: false, message: "We couldn't find this order." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return { ok: false, message: "Payments are not set up yet." };

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, status, payment_status, customer_email, subtotal_kobo")
    .eq("public_token", token)
    .maybeSingle();

  if (!order) return { ok: false, message: "We couldn't find this order." };
  if (order.payment_status === "paid") {
    return { ok: false, message: "This order has already been paid." };
  }
  if (order.status !== "pending_payment" || order.subtotal_kobo <= 0) {
    return { ok: false, message: "This order can no longer be paid." };
  }

  // The 15-minute hold on the items must still be running
  const { data: expired } = await admin
    .from("stock_reservations")
    .select("id")
    .eq("order_id", order.id)
    .eq("status", "active")
    .lte("expires_at", new Date().toISOString())
    .limit(1);
  if (expired && expired.length > 0) {
    return {
      ok: false,
      message:
        "Your 15-minute hold on these items has ended. Please return to your cart and place the order again.",
    };
  }

  // The amount always comes from the database, never from the browser
  const reference = `${order.order_number}-${randomBytes(6).toString("hex")}`;

  const { error: insertError } = await admin.from("payments").insert({
    order_id: order.id,
    reference,
    amount_kobo: order.subtotal_kobo,
    status: "pending",
  });
  if (insertError) {
    console.error("payment insert failed", insertError.message);
    return { ok: false, message: "We couldn't start your payment. Please try again." };
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: order.customer_email,
      amountKobo: order.subtotal_kobo,
      reference,
      callbackUrl: `${site}/payment/callback`,
      metadata: { order_number: order.order_number },
    });
    return { ok: true, url: authorizationUrl };
  } catch (e) {
    console.error("paystack initialize failed", e);
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return { ok: false, message: "We couldn't start your payment. Please try again." };
  }
}