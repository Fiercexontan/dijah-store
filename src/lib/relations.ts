// Supabase returns a joined row as one object, but without generated
// types TypeScript can't tell. This reads the name either way.
export function relName(
  rel: { name: string } | { name: string }[] | null | undefined
): string | undefined {
  return Array.isArray(rel) ? rel[0]?.name : rel?.name;
}