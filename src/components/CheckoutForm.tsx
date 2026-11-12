"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/format";
import { getCartItems, type CartItem } from "@/app/(store)/cart/actions";
import { placeOrder } from "@/app/(store)/checkout/actions";

const field =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

export default function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMessage, setGeoMessage] = useState("");

  const idsKey = cart.lines.map((l) => l.variantId).sort().join(",");

  useEffect(() => {
    if (!cart.ready) return;
    if (!idsKey) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getCartItems(idsKey.split(","))
      .then((res) => {
        if (!cancelled) {
          setItems(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cart.ready, idsKey]);

  if (!cart.ready || loading) {
    return <p className="mt-8 text-white/70">Loading…</p>;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="glass mt-8 rounded-2xl p-8 text-center">
        <p className="font-heading text-2xl">Your cart is empty</p>
        <Link
          href="/shop"
          className="mt-5 inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-night"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  let subtotal = 0;
  let cartProblem = false;
  const summary = cart.lines.map((line) => {
    const item = items.find((i) => i.variantId === line.variantId);
    if (!item || (!item.isPreorder && line.quantity > item.stock)) {
      cartProblem = true;
      return null;
    }
    subtotal += item.unitPriceKobo * line.quantity;
    return (
      <li key={line.variantId} className="flex justify-between gap-3 text-sm">
        <span>
          {item.name} · {item.colorName} · {item.sizeLabel} × {line.quantity}
        </span>
        <span className="shrink-0">{naira(item.unitPriceKobo * line.quantity)}</span>
      </li>
    );
  });

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoMessage("Your device can't share its location.");
      return;
    }
    setGeoMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoMessage("Location added. We'll use it only to find you for delivery.");
      },
      () => setGeoMessage("We couldn't get your location. You can skip this."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || cartProblem) return;
    setSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");

    try {
      const result = await placeOrder({
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        state: get("state"),
        town: get("town"),
        area: get("area"),
        address: get("address"),
        landmark: get("landmark"),
        notes: get("notes"),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        agreed,
        items: cart.lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
      });

      if (result.ok) {
        router.push(`/order/${result.token}`);
        return; // keep the button disabled while we move on
      }
      setError(result.message);
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-5">
        <h2 className="font-heading text-2xl text-gold">Your details</h2>

        <label className="block text-sm">
          Full name
          <input name="name" required autoComplete="name" className={field} />
        </label>

        <label className="block text-sm">
          Phone number (WhatsApp if possible)
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0801 234 5678"
            className={field}
          />
        </label>

        <label className="block text-sm">
          Email (for your order confirmation)
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>

        <h2 className="font-heading pt-2 text-2xl text-gold">Delivery</h2>

        <label className="block text-sm">
          State
          <select name="state" defaultValue="Oyo" className={field}>
            <option value="Oyo" className="text-black">Oyo</option>
          </select>
        </label>
        <p className="-mt-2 text-xs text-white/60">
          We currently deliver within Oyo State. For other locations, message us on
          WhatsApp.
        </p>

        <label className="block text-sm">
          Town or city
          <input name="town" required defaultValue="Ibadan" className={field} />
        </label>

        <label className="block text-sm">
          Area or neighbourhood (optional)
          <input name="area" placeholder="e.g. Bodija, Sango" className={field} />
        </label>

        <label className="block text-sm">
          Full delivery address
          <textarea name="address" required rows={3} className={field} />
        </label>

        <label className="block text-sm">
          Nearest landmark (optional)
          <input name="landmark" className={field} />
        </label>

        <div>
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-xl border border-white/30 px-4 py-2 text-sm"
          >
            {coords ? "Update my location" : "Share my current location (optional)"}
          </button>
          {geoMessage && <p className="mt-2 text-xs text-lilac">{geoMessage}</p>}
        </div>

        <label className="block text-sm">
          Notes for your order (optional)
          <textarea name="notes" rows={2} className={field} />
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5"
          />
          <span>
            I have read and understood the{" "}
            <Link href="/returns" target="_blank" className="text-gold underline">
              return policy
            </Link>
            , including that returns are only accepted for DIJAH&apos;s mistakes
            and not for a change of mind or a wrong size or colour I selected.
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/20 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        {cartProblem && (
          <p role="alert" className="rounded-xl bg-red-500/20 px-4 py-3 text-sm">
            Something in your cart changed.{" "}
            <Link href="/cart" className="underline">
              Please review your cart
            </Link>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || cartProblem || !agreed}
          className="w-full rounded-xl bg-gold py-3 font-semibold text-night disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Placing your order…" : "Place order"}
        </button>
      </form>

      <aside className="glass h-fit rounded-2xl p-5">
        <p className="font-heading text-xl">Order summary</p>
        <ul className="mt-4 space-y-2">{summary}</ul>
        <div className="mt-4 flex justify-between border-t border-white/20 pt-4">
          <span className="text-white/70">Items total</span>
          <span className="font-semibold">{naira(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-white/60">
          Delivery fee is not included. We&apos;ll confirm it with you on WhatsApp.
        </p>
      </aside>
    </div>
  );
}