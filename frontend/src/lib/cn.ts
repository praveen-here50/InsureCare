/**
 * Utility for merging Tailwind class names.
 *
 * Accepts strings, arrays, or conditional class entries (falsy values filtered).
 * No dependencies — kept intentionally minimal; can be swapped for
 * `clsx` + `tailwind-merge` when class conflicts arise.
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}