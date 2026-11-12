import Image from "next/image";
import Link from "next/link";
import CartLink from "./CartLink";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-3 py-2">
        <Link href="/" className="flex items-center gap-3" aria-label="DIJAH home">
          <Image
            src="/dijah-logo.png"
            alt="DIJAH Fashion & Accessories"
            width={1349}
            height={898}
            priority
            className="h-12 w-auto rounded-xl bg-mist"
          />
                    <span className="font-heading hidden text-lg leading-tight tracking-wide text-gold sm:inline">
            DIJAH FASHION &amp; ACCESSORIES
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link href="/shop" className="rounded-xl px-4 py-2 hover:bg-white/10">
            Shop
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}