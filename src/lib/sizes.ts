export const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];

export const SHOE_SIZES = [
  "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47",
];

// Jeans: waist number with its letter size, from the size chart
export const JEANS_SIZES = [
  "26 (XS)", "28 (S)", "30 (M)", "32 (L)", "34 (XL)",
  "36 (XXL)", "38 (3XL)", "40 (4XL)", "42 (5XL)",
];

// Which sizes a category offers, based on its size_type
export function sizesFor(sizeType: string | null | undefined): string[] {
  switch (sizeType) {
    case "clothing":
      return CLOTHING_SIZES;
    case "shoe":
      return SHOE_SIZES;
    case "waist":
    case "clothing_waist":
      return JEANS_SIZES;
    default:
      return [];
  }
}