import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, sendEmail } from "@/lib/email";
import { naira } from "@/lib/format";

export async function notifyOwnerOfPaidOrder(orderId: string) {
  const to = process.env.OWNER_NOTIFY_EMAIL;
  if (!to) {
    console.error("OWNER_NOTIFY_EMAIL is not set");
    return;
  }

  const admin = createAdminClient();

  // Claim the alert first, so it is sent only once even if two confirmations overlap
  const { data: claimed } = await admin
    .from("orders")
    .update({ owner_notified_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("owner_notified_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return;

  const release = async () => {
    await admin.from("orders").update({ owner_notified_at: null }).eq("id", orderId);
  };

  const { data: o } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, customer_email, delivery_state, delivery_town, delivery_area, delivery_address, delivery_landmark, delivery_lat, delivery_lng, notes, subtotal_kobo, has_preorder, needs_attention, attention_note, order_items(product_name, color_name, size_label, unit_price_kobo, quantity)"
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!o) {
    await release();
    return;
  }

  const items = o.order_items ?? [];
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const adminUrl = `${site}/admin/orders/${o.id}`;
  const whatsapp = `https://wa.me/${o.customer_phone.replace(/\D/g, "")}`;
  const place = [o.delivery_area, o.delivery_town, o.delivery_state]
    .filter(Boolean)
    .join(", ");
  const mapUrl =
    o.delivery_lat !== null && o.delivery_lng !== null
      ? `https://www.google.com/maps?q=${Number(o.delivery_lat)},${Number(o.delivery_lng)}`
      : null;

  const subject = `New paid order ${o.order_number} · ${naira(o.subtotal_kobo)}`;

  const itemLines = items.map(
    (i) =>
      `${i.product_name} · ${i.color_name} · ${i.size_label} × ${i.quantity} — ${naira(i.unit_price_kobo * i.quantity)}`
  );

  const text = [
    `New paid order ${o.order_number}`,
    o.has_preorder ? "Includes PRE-ORDER items" : "",
    o.needs_attention ? `NEEDS ATTENTION: ${o.attention_note ?? ""}` : "",
    "",
    `Customer: ${o.customer_name}`,
    `Phone: ${o.customer_phone}`,
    `Email: ${o.customer_email}`,
    `WhatsApp: ${whatsapp}`,
    "",
    `Deliver to: ${o.delivery_address}`,
    place,
    o.delivery_landmark ? `Landmark: ${o.delivery_landmark}` : "",
    mapUrl ? `Shared location: ${mapUrl}` : "",
    o.notes ? `Customer note: ${o.notes}` : "",
    "",
    "Items:",
    ...itemLines,
    "",
    `Items total: ${naira(o.subtotal_kobo)} (delivery fee still to be agreed on WhatsApp)`,
    "",
    `Open the order: ${adminUrl}`,
  ]
    .filter((l, idx, arr) => l !== "" || arr[idx - 1] !== "")
    .join("\n");

  const e = escapeHtml;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#240638">
    <h2 style="margin:0 0 4px">New paid order ${e(o.order_number)}</h2>
    <p style="margin:0 0 16px;color:#480060">${e(naira(o.subtotal_kobo))} received</p>
    ${o.has_preorder ? '<p style="background:#fde7f3;padding:8px 12px;border-radius:8px"><b>Includes pre-order items</b></p>' : ""}
    ${o.needs_attention ? `<p style="background:#fee2e2;padding:8px 12px;border-radius:8px"><b>Needs attention:</b> ${e(o.attention_note ?? "")}</p>` : ""}
    <h3 style="margin:16px 0 4px">Customer</h3>
    <p style="margin:0">${e(o.customer_name)}<br>${e(o.customer_phone)}<br>${e(o.customer_email)}</p>
    <p><a href="${e(whatsapp)}">Message on WhatsApp</a></p>
    <h3 style="margin:16px 0 4px">Deliver to</h3>
    <p style="margin:0">${e(o.delivery_address)}<br>${e(place)}${o.delivery_landmark ? `<br>Landmark: ${e(o.delivery_landmark)}` : ""}</p>
    ${mapUrl ? `<p><a href="${e(mapUrl)}">Open shared location in Maps</a></p>` : ""}
    ${o.notes ? `<p>Customer note: ${e(o.notes)}</p>` : ""}
    <h3 style="margin:16px 0 4px">Items</h3>
    <ul style="padding-left:18px;margin:0">${itemLines.map((l) => `<li>${e(l)}</li>`).join("")}</ul>
    <p style="margin-top:12px"><b>Items total: ${e(naira(o.subtotal_kobo))}</b><br>
    <span style="color:#666">Delivery fee still to be agreed with the customer on WhatsApp.</span></p>
    <p style="margin-top:20px"><a href="${e(adminUrl)}" style="background:#480060;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open the order</a></p>
  </div>`;

  const sent = await sendEmail({ to, subject, html, text });
  if (!sent) await release(); // lets the next confirmation try again
}