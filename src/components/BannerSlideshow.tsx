"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  href: string | null;
  endsText: string | null;
};

const INTERVAL_MS = 5000;
const SLIDE_MS = 700;

export default function BannerSlideshow({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => (i >= n ? i : i + 1));
  }, [n]);

  const prev = useCallback(() => {
    if (index > 0) {
      setAnimate(true);
      setIndex(index - 1);
      return;
    }
    // From the first slide, jump (unseen) to the copy of it at the end, then slide back
    setAnimate(false);
    setIndex(n);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setIndex(n - 1);
      })
    );
  }, [index, n]);

  useEffect(() => {
    if (n < 2 || paused || reduced) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [n, paused, reduced, next]);

  // After sliding onto the copy of the first slide, snap back to the real one
  function onTransitionEnd(e: React.TransitionEvent<HTMLUListElement>) {
    if (e.target !== e.currentTarget) return;
    if (index === n) {
      setAnimate(false);
      setIndex(0);
    }
  }

  // The copy of the first slide at the end makes the loop seamless
  const items = n > 1 ? [...slides, slides[0]] : slides;
  const active = n > 0 ? index % n : 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        setPaused(false);
        if (start === null || n < 2) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) {
          if (dx < 0) next();
          else prev();
        }
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div className="overflow-hidden rounded-3xl">
        <ul
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate && !reduced ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {items.map((s, i) => {
            const isClone = n > 1 && i === n;
            const body = (
              <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-night/90 via-night/30 to-transparent" />

                <span className="absolute left-4 top-4 rounded-full bg-rose px-3 py-1 text-xs font-bold uppercase tracking-widest text-night">
                  Promo
                </span>
                {s.endsText && (
                  <span className="absolute right-4 top-4 rounded-full bg-night/70 px-3 py-1 text-xs text-gold backdrop-blur">
                    {s.endsText}
                  </span>
                )}

                <div className="absolute bottom-0 p-5 pb-8">
                  <p className="font-heading text-2xl font-bold text-gold sm:text-4xl">
                    {s.title}
                  </p>
                  {s.subtitle && (
                    <p className="mt-1 text-sm text-white/90 sm:text-base">{s.subtitle}</p>
                  )}
                </div>
              </div>
            );

            return (
              <li key={i} className="w-full shrink-0" aria-hidden={isClone || undefined}>
                {s.href ? (
                  <Link href={s.href} tabIndex={isClone ? -1 : undefined}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {n > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Show promotion ${i + 1}`}
              aria-current={i === active}
              onClick={() => {
                setAnimate(true);
                setIndex(i);
              }}
              className={
                "h-2 rounded-full transition-all " +
                (i === active ? "w-6 bg-gold" : "w-2 bg-white/50")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}