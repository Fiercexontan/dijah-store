"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

type Size = { id: string; label: string; stock: number };
type ColorOption = {
  id: string;
  name: string;
  images: string[];
  sizes: Size[];
};

type Props = {
  name: string;
  priceText: string;
  salePriceText: string | null;
  isPreorder: boolean;
  expectedText: string | null;
  colors: ColorOption[];
  whatsappNumber: string | null;
};

export default function ProductView({
  name,
  priceText,
  salePriceText,
  isPreorder,
  expectedText,
  colors,
  whatsappNumber,
}: Props) {
  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const color = colors[colorIndex];
    const selectedSize = color?.sizes.find((s) => s.label === size);

  function addToCart() {
    if (!selectedSize) return;
    cart.add(selectedSize.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  }

  function chat(extra?: string) {
    if (!whatsappNumber) return;
    const lines = [`Hello DIJAH FASHION & ACCESSORIES, I'm interested in: ${name}`];
    if (color) lines.push(`Colour: ${color.name}`);
    if (size) lines.push(`Size: ${size}`);
    if (extra) lines.push(extra);
    lines.push(window.location.href);
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function pickColor(i: number) {
    setColorIndex(i);
    setImageIndex(0);
    setSize(null);
  }

  if (!color) {
    return (
      <p className="mt-6 text-lilac">
        Details for this item are coming soon.
      </p>
    );
  }

  const mainImage = color.images[imageIndex];

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-3xl bg-white/10">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage}
              alt={`${name} in ${color.name}`}
              className="aspect-3/4 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-3/4 items-center justify-center text-sm text-purple-300">
              No photo yet
            </div>
          )}
        </div>

        {color.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {color.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImageIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={
                  "h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 " +
                  (i === imageIndex ? "border-white" : "border-transparent opacity-70")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{name}</h1>

        <p className="mt-2 text-xl">
          {salePriceText ? (
            <>
              <span className="font-semibold">{salePriceText}</span>{" "}
              <span className="text-base text-purple-300 line-through">{priceText}</span>
            </>
          ) : (
            <span className="font-semibold text-gold">{salePriceText}</span>
          )}
        </p>

        {isPreorder && (
          <p className="mt-3 rounded-xl bg-rose/20 px-4 py-3 text-sm text-rose">
            Pre-order item.{" "}
            {expectedText
              ? `Expected around ${expectedText}.`
              : "We'll confirm the arrival date with you on WhatsApp after payment."}
          </p>
        )}

        <p className="mt-6 text-sm text-lilac">
          Colour: <span className="font-semibold text-white">{color.name}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <button
              key={c.id}
              onClick={() => pickColor(i)}
              aria-pressed={i === colorIndex}
              className={
                "flex flex-col items-center gap-1 rounded-xl border-2 p-1 text-xs " +
                (i === colorIndex ? "border-white" : "border-white/20")
              }
            >
              {c.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.images[0]}
                  alt=""
                  className="h-14 w-11 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-14 w-11 items-center justify-center rounded-lg bg-white/10">
                  ·
                </span>
              )}
              {c.name}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-lilac">Size</p>
        {color.sizes.length === 0 ? (
          <p className="mt-2 text-sm text-lilac">
            No sizes listed for this colour yet. Ask us on WhatsApp.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {color.sizes.map((s) => {
              const available = s.stock > 0 || isPreorder;
              return (
                <button
                  key={s.label}
                  disabled={!available}
                  onClick={() => setSize(s.label)}
                  aria-pressed={size === s.label}
                  className={
                    "rounded-xl border-2 px-4 py-2 text-sm " +
                    (size === s.label ? "border-white bg-white/20 " : "border-white/25 ") +
                    (available ? "" : "cursor-not-allowed text-white/40 line-through")
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
        {size && !isPreorder && (
          <p className="mt-2 text-xs text-lilac">
            {(() => {
              const left = color.sizes.find((s) => s.label === size)?.stock ?? 0;
              return left <= 3 ? `Only ${left} left` : "In stock";
            })()}
          </p>
        )}
        
                <div className="mt-8">
          <button
            onClick={addToCart}
            disabled={!selectedSize}
            className="w-full rounded-xl bg-gold py-3 font-semibold text-night disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedSize ? "Add to cart" : "Choose a size to add to cart"}
          </button>
          {justAdded && (
            <p role="status" className="mt-2 text-center text-sm text-mint">
              Added to your cart.{" "}
              <Link href="/cart" className="underline">
                View cart
              </Link>
            </p>
          )}
        </div> 
         
        {whatsappNumber && (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => chat()}
              className="w-full rounded-xl bg-mint py-3 font-semibold text-night"
            >
              Ask about this on WhatsApp
            </button>
            <button
              onClick={() => chat("I'd like to ask about another colour or size.")}
              className="w-full rounded-xl border border-white/30 py-3 text-sm"
            >
              Need another colour or size? Ask us
            </button>
          </div>
        )}
      </div>
    </div>
  );
}