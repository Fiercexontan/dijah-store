import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.paystack.co";

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured");
  return key;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json?.data?.authorization_url) {
    throw new Error(`Paystack initialize failed: ${json?.message ?? res.status}`);
  }
  return { authorizationUrl: json.data.authorization_url as string };
}

// Always ask Paystack directly. Never trust a payment status from the browser.
export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    }
  );

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json?.data) {
    throw new Error(`Paystack verify failed: ${json?.message ?? res.status}`);
  }
  return {
    status: json.data.status as string,
    amountKobo: json.data.amount as number,
    currency: json.data.currency as string,
    reference: json.data.reference as string,
  };
}

// Paystack signs the raw request body with HMAC-SHA512 using the secret key
export function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}