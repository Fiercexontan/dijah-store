import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  categoryName?: string;
  priceText: string;
  salePriceText: string | null;
  isPreorder: boolean;
  imageUrl: string | null;
};

export default function ProductCard({
  slug,
  name,
  categoryName,
  priceText,
  salePriceText,
  isPreorder,
  imageUrl,
}: Props) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group block transition duration-300 ease-out hover:-translate-y-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/10 shadow-lg transition duration-300 group-hover:shadow-2xl group-hover:shadow-black/40">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="aspect-[3/4] w-full object-cover transition duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-sm text-lilac">
            No photo yet
          </div>
        )}
        {isPreorder && (
          <span className="absolute left-2 top-2 rounded-full bg-rose px-2 py-1 text-xs font-semibold text-night">
            Pre-order
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold">{name}</p>
      {categoryName && <p className="text-xs text-white/60">{categoryName}</p>}
      <p className="mt-1 text-sm">
        {salePriceText ? (
          <>
            <span className="font-semibold text-gold">{salePriceText}</span>{" "}
            <span className="text-xs text-white/50 line-through">{priceText}</span>
          </>
        ) : (
          <span className="font-semibold">{priceText}</span>
        )}
      </p>
    </Link>
  );
}