export function naira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

// The first photo of the first colour is the product's main photo
export function mainImagePath(
  colors: { id: string; sort_order: number }[],
  images: { color_id: string | null; storage_path: string; sort_order: number }[]
): string | null {
  const firstColor = [...colors].sort((a, b) => a.sort_order - b.sort_order)[0];
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const img = sorted.find((i) => i.color_id === firstColor?.id) ?? sorted[0];
  return img?.storage_path ?? null;
}