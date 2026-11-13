import Link from "next/link";

const links = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/returns", label: "Return policy" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 px-4 pb-10">
      <div className="glass mx-auto max-w-6xl rounded-2xl p-6 text-sm">
        <p className="font-heading text-xl text-gold">
          DIJAH FASHION &amp; ACCESSORIES
        </p>
        <p className="mt-1 text-lilac">Trendy • Classy • Affordable</p>
        <p className="mt-3 text-white/70">Ibadan, Oyo State, Nigeria</p>

        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="underline">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-3 flex gap-5">
          <a
            href="https://www.instagram.com/dijah5555"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@fagbenrokhadijat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}