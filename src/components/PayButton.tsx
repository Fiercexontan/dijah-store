"use client";

import { useState } from "react";
import { startPayment } from "@/app/(store)/checkout/payment-actions";

export default function PayButton({
  token,
  amountText,
}: {
  token: string;
  amountText: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await startPayment(token);
      if (result.ok) {
        window.location.href = result.url;
        return; // stay disabled while we leave
      }
      setError(result.message);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={busy}
        className="w-full rounded-xl bg-gold py-3 font-semibold text-night disabled:opacity-60"
      >
        {busy ? "Taking you to payment…" : `Pay ${amountText}`}
      </button>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/20 px-4 py-3 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}