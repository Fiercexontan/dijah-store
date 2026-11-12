import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading text-4xl font-bold">Checkout</h1>
      <CheckoutForm />
    </main>
  );
}