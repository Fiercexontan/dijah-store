"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type CheckoutInput = {
  name: string;
  phone: string;
  email: string;
  state: string;
  town: string;
  area: string;
  address: string;
  landmark: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  agreed: boolean;
  items: { variantId: string; quantity: number }[];
};

export type CheckoutResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^0\d{10}$/.test(digits)) return "+234" + digits.slice(1);
  if (/^234\d{10}$/.test(digits)) return "+" + digits;
  if (/^\+234\d{10}$/.test(digits)) return digits;
  return null;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = clean(input?.name, 100);
  const email = clean(input?.email, 254).toLowerCase();
  const phone = normalisePhone(clean(input?.phone, 30));
  const state = clean(input?.state, 40);
  const town = clean(input?.town, 80);
  const area = clean(input?.area, 100);
  const address = clean(input?.address, 300);
  const landmark = clean(input?.landmark, 150);
  const notes = clean(input?.notes, 500);

  if (name.length < 2) return { ok: false, message: "Please enter your full name." };
  if (!phone) {
    return { ok: false, message: "Please enter a valid Nigerian phone number, like 0801 234 5678." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (state !== "Oyo") {
    return { ok: false, message: "We currently deliver within Oyo State. Please message us on WhatsApp for other locations." };
  }
  if (town.length < 2) return { ok: false, message: "Please enter your town or city." };
  if (address.length < 5) return { ok: false, message: "Please enter your full delivery address." };
  if (input?.agreed !== true) {
    return { ok: false, message: "Please confirm that you have read the return policy." };
  }

  const lat =
    typeof input.lat === "number" && input.lat >= -90 && input.lat <= 90
      ? Math.round(input.lat * 1e5) / 1e5
      : null;
  const lng =
    typeof input.lng === "number" && input.lng >= -180 && input.lng <= 180
      ? Math.round(input.lng * 1e5) / 1e5
      : null;

  const items = Array.isArray(input.items) ? input.items.slice(0, 30) : [];
  const validItems = items.filter(
    (i) =>
      typeof i?.variantId === "string" &&
      UUID.test(i.variantId) &&
      Number.isInteger(i.quantity) &&
      i.quantity >= 1 &&
      i.quantity <= 10
  );
  if (validItems.length === 0 || validItems.length !== items.length) {
    return { ok: false, message: "Your cart looks empty or invalid. Please check your cart." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("create_order", {
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_state: state,
    p_town: town,
    p_area: area,
    p_address: address,
    p_landmark: landmark,
    p_lat: lat,
    p_lng: lng,
    p_notes: notes,
    p_items: validItems.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
    })),
  });

  if (error) {
    const m = error.message ?? "";
    if (m.includes("insufficient_stock")) {
      const item = m.split("insufficient_stock:")[1]?.trim();
      return {
        ok: false,
        message: `Sorry, ${item ?? "an item"} is no longer available in the quantity you chose. Please update your cart.`,
      };
    }
    if (m.includes("unavailable_item")) {
      return { ok: false, message: "One of the items in your cart is no longer available. Please update your cart." };
    }
    console.error("create_order failed", m);
    return { ok: false, message: "We couldn't place your order. Please try again." };
  }

  const token = (data as { public_token?: string } | null)?.public_token;
  if (!token) {
    return { ok: false, message: "We couldn't place your order. Please try again." };
  }
  return { ok: true, token };
}