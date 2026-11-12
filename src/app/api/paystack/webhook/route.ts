import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSignature } from "@/lib/paystack";
import { confirmPayment } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // The signature is calculated over the exact raw text, so read it as text
  const raw = await request.text();
  if (raw.length > 200_000) {
    return new NextResponse("Too large", { status: 413 });
  }

  if (!isValidSignature(raw, request.headers.get("x-paystack-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: {
    event?: string;
    data?: { id?: number | string; reference?: string };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  const type = typeof event.event === "string" ? event.event : "unknown";
  const reference = event.data?.reference;
  const eventKey = `${type}:${event.data?.id ?? reference ?? "none"}`;

  const admin = createAdminClient();

  // Record the event once. The same event arriving again is recognised and skipped.
  const { error: insertError } = await admin.from("webhook_events").insert({
    provider: "paystack",
    event_key: eventKey,
    event_type: type,
    payload: event,
  });

  if (insertError) {
    if (insertError.code !== "23505") {
      console.error("webhook insert failed", insertError.message);
      return new NextResponse("Retry later", { status: 500 });
    }
    const { data: existing } = await admin
      .from("webhook_events")
      .select("processed_at")
      .eq("event_key", eventKey)
      .maybeSingle();
    if (existing?.processed_at) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Seen before but never finished processing: fall through and try again
  }

  if (type === "charge.success" && typeof reference === "string") {
    const result = await confirmPayment(reference);
    if (!result.ok && result.reason === "error") {
      // A temporary problem. Returning an error makes Paystack retry later.
      return new NextResponse("Retry later", { status: 500 });
    }
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_key", eventKey);

  return NextResponse.json({ received: true });
}