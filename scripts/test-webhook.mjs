import { createHmac } from "node:crypto";

const reference = process.argv[2];
if (!reference) {
  console.log("Usage: node --env-file=.env.local scripts/test-webhook.mjs <payment reference>");
  process.exit(1);
}

const body = JSON.stringify({
  event: "charge.success",
  data: { id: 999000111, reference },
});
const good = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
  .update(body)
  .digest("hex");

const attempts = [
  ["valid signature", good],
  ["same event again", good],
  ["forged signature", "0".repeat(128)],
];

for (const [label, signature] of attempts) {
  const res = await fetch("http://localhost:3000/api/paystack/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-paystack-signature": signature },
    body,
  });
  console.log(label.padEnd(18), res.status, await res.text());
}