"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${ready ? count : 0} items`}
      className="rounded-xl px-4 py-2 hover:bg-white/10"
    >
      Cart
      {ready && count > 0 && (
        <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-night">
          {count}
        </span>
      )}
    </Link>
  );
}