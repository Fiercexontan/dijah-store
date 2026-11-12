import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading text-4xl font-bold">Your cart</h1>
      <CartView />
    </main>
  );
}