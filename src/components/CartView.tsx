"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, MAX_PER_LINE } from "@/lib/cart";
import { getCartItems, type CartItem } from "@/app/(store)/cart/actions";
import { naira } from "@/lib/format";

export default function CartView() {
  const cart = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const idsKey = cart.lines
    .map((l) => l.variantId)
    .sort()
    .join(",");

  useEffect(() => {
    if (!cart.ready) return;
    if (!idsKey) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getCartItems(idsKey.split(","))
      .then((res) => {
        if (!cancelled) {
          setItems(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cart.ready, idsKey]);

  if (!cart.ready || loading) {
    return <p className="mt-8 text-white/70">Loading your cart…</p>;
  }

  if (failed) {
    return (
      <p className="mt-8 text-rose">
        We couldn&apos;t load your cart. Please refresh the page.
      </p>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="glass mt-8 rounded-2xl p-8 text-center">
        <p className="font-heading text-2xl">Your cart is empty</p>
        <p className="mt-2 text-white/70">Find something you love in the shop.</p>
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

  const rows = cart.lines.map((line) => {
    const item = items.find((i) => i.variantId === line.variantId);

    if (!item) {
      return (
        <li key={line.variantId} className="glass rounded-2xl p-4">
          <p className="text-sm text-rose">
            This item is no longer available.
          </p>
          <button
            onClick={() => cart.remove(line.variantId)}
            className="mt-2 text-sm underline"
          >
            Remove
          </button>
        </li>
      );
    }

    const max = item.isPreorder ? MAX_PER_LINE : Math.min(MAX_PER_LINE, item.stock);
    const soldOut = max <= 0;
    const qty = soldOut ? 0 : Math.min(line.quantity, max);
    subtotal += item.unitPriceKobo * qty;

    return (
      <li key={line.variantId} className="glass flex gap-4 rounded-2xl p-4">
        <Link href={`/product/${item.slug}`} className="shrink-0">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-28 w-20 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-28 w-20 items-center justify-center rounded-xl bg-white/10 text-xs text-lilac">
              No photo
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/product/${item.slug}`} className="font-semibold">
            {item.name}
          </Link>
          <p className="text-sm text-white/70">
            {item.colorName} · {item.sizeLabel}
            {item.isPreorder ? " · Pre-order" : ""}
          </p>
          <p className="mt-1 text-gold">{naira(item.unitPriceKobo)}</p>

          {soldOut ? (
            <p className="mt-2 text-sm text-rose">Sold out</p>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <button
                aria-label="Decrease quantity"
                onClick={() => cart.setQuantity(line.variantId, qty - 1)}
                className="h-9 w-9 rounded-lg border border-white/30 text-lg"
              >
                −
              </button>
              <span aria-live="polite" className="w-6 text-center">
                {qty}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => cart.setQuantity(line.variantId, qty + 1)}
                disabled={qty >= max}
                className="h-9 w-9 rounded-lg border border-white/30 text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
          )}

          {!soldOut && line.quantity > max && (
            <p className="mt-2 text-xs text-rose">
              Only {max} available, so we&apos;ve adjusted the quantity.
            </p>
          )}

          <button
            onClick={() => cart.remove(line.variantId)}
            className="mt-3 text-xs text-white/60 underline"
          >
            Remove
          </button>
        </div>
      </li>
    );
  });

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="space-y-3">{rows}</ul>

      <aside className="glass h-fit rounded-2xl p-5">
        <p className="font-heading text-xl">Order summary</p>
        <div className="mt-4 flex justify-between">
          <span className="text-white/70">Items total</span>
          <span className="font-semibold">{naira(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-white/60">
          Delivery fee is not included. We&apos;ll confirm it with you on
          WhatsApp after you order.
        </p>
        <Link
          href="/checkout"
          className="mt-5 block rounded-xl bg-gold py-3 text-center font-semibold text-night"
        >
          Continue to checkout
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-sm underline">
          Keep shopping
        </Link>
      </aside>
    </div>
  );
}