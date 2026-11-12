import {
  Playfair_Display,
  DM_Sans,
  Bodoni_Moda,
  Manrope,
  Fraunces,
  Poppins,
} from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"] });
const bodoni = Bodoni_Moda({ subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"] });
const fraunces = Fraunces({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

type Look = {
  name: string;
  mood: string;
  headingFont: string;
  headingName: string;
  bodyFont: string;
  bodyName: string;
  bg: string;
  muted: string;
  accent: string;
  accentText: string;
  swatches: [string, string][];
};

const looks: Look[] = [
  {
    name: "A · Royal Gold",
    mood: "Luxury, crown and classic",
    headingFont: playfair.className,
    headingName: "Playfair Display",
    bodyFont: dmSans.className,
    bodyName: "DM Sans",
    bg: "linear-gradient(135deg,#1E0A33,#4B1D7A 60%,#2A0F4D)",
    muted: "#D9C8F0",
    accent: "#D4AF6A",
    accentText: "#2A0F4D",
    swatches: [
      ["Ink", "#1E0A33"],
      ["Royal purple", "#4B1D7A"],
      ["Lavender", "#E9DDF7"],
      ["Champagne gold", "#D4AF6A"],
      ["Cream", "#FBF7F2"],
    ],
  },
  {
    name: "B · Orchid Rose",
    mood: "Soft glam, feminine and warm",
    headingFont: bodoni.className,
    headingName: "Bodoni Moda",
    bodyFont: manrope.className,
    bodyName: "Manrope",
    bg: "linear-gradient(135deg,#2B0F45,#7A2E9B 55%,#C04A8E)",
    muted: "#F3D5EA",
    accent: "#F9A8D4",
    accentText: "#3B0A45",
    swatches: [
      ["Plum", "#2B0F45"],
      ["Orchid", "#7A2E9B"],
      ["Rose", "#C04A8E"],
      ["Blush", "#F9A8D4"],
      ["Pearl", "#FFF1F7"],
    ],
  },
  {
    name: "C · Violet Mint",
    mood: "Youthful, fresh and bold",
    headingFont: fraunces.className,
    headingName: "Fraunces",
    bodyFont: poppins.className,
    bodyName: "Poppins",
    bg: "linear-gradient(135deg,#1F1147,#5B3FD1 55%,#2A8F8A)",
    muted: "#D6D0F5",
    accent: "#5EEAD4",
    accentText: "#12123A",
    swatches: [
      ["Midnight", "#1F1147"],
      ["Violet", "#5B3FD1"],
      ["Teal", "#2A8F8A"],
      ["Mint", "#5EEAD4"],
      ["Ice", "#F3F0FF"],
    ],
  },
];

function Preview({ look }: { look: Look }) {
  return (
    <section
      className={`${look.bodyFont} rounded-3xl p-6 text-white sm:p-8`}
      style={{ background: look.bg }}
    >
      <p className="text-xs uppercase tracking-[0.25em]" style={{ color: look.muted }}>
        {look.name} · {look.mood}
      </p>

      <h2 className={`${look.headingFont} mt-3 text-6xl font-bold tracking-wide`}>
        DIJAH
      </h2>
      <p className="mt-1" style={{ color: look.muted }}>
        Fashion &amp; Accessories · Trendy • Classy • Affordable
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/25 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div
            className="aspect-[3/4] rounded-2xl"
            style={{
              background: `linear-gradient(160deg, ${look.accent}55, #ffffff10)`,
            }}
          />
          <h3 className={`${look.headingFont} mt-4 text-2xl font-semibold`}>
            Black denim jean
          </h3>
          <p className="mt-1 text-lg font-semibold">₦18,000</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {["26 (XS)", "28 (S)", "30 (M)", "32 (L)"].map((s, i) => (
              <span
                key={s}
                className="rounded-xl border px-3 py-1 text-sm"
                style={
                  i === 1
                    ? { background: look.accent, color: look.accentText, borderColor: look.accent }
                    : { borderColor: "#ffffff55" }
                }
              >
                {s}
              </span>
            ))}
          </div>

          <button
            className="mt-4 w-full rounded-xl py-3 font-semibold"
            style={{ background: look.accent, color: look.accentText }}
          >
            Ask on WhatsApp
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {look.swatches.map(([label, hex]) => (
              <div key={hex} className="text-center text-xs">
                <div
                  className="h-14 w-14 rounded-2xl border border-white/30"
                  style={{ background: hex }}
                />
                <p className="mt-1" style={{ color: look.muted }}>{label}</p>
                <p style={{ color: look.muted }}>{hex}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
            <p className={`${look.headingFont} text-xl font-semibold`}>
              Dresses &amp; Gowns
            </p>
            <p className="mt-2 text-sm" style={{ color: look.muted }}>
              Trendy, classy and affordable pieces for every occasion. Choose your
              colour, pick your size and chat with us directly on WhatsApp.
            </p>
            <p className="mt-3 text-xs" style={{ color: look.muted }}>
              Headings: {look.headingName} · Text: {look.bodyName}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DesignPreview() {
  return (
    <main className="min-h-screen space-y-8 bg-neutral-950 px-4 py-8">
      <h1 className="text-center text-sm uppercase tracking-widest text-neutral-400">
        Design preview · temporary page
      </h1>
      {looks.map((look) => (
        <Preview key={look.name} look={look} />
      ))}
    </main>
  );
}