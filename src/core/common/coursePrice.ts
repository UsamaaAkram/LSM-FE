// #18 — course prices are free text so labels like "Free", "Coming Soon" or
// "Contact Us" work alongside real amounts.
//
// Two things this has to survive:
//  1. Legacy rows: price used to be a Number, so Mongoose now hands back the
//     STRING "0" for old courses. "0" is truthy, so a naive `price && ...`
//     check would render "Rs 0" on every pre-existing course.
//  2. Numeric input should still get thousands separators; text must be shown
//     exactly as the admin typed it, with no formatting applied.

/** True when there is a real price/label worth showing. */
export const hasPrice = (v: unknown): boolean => {
  const s = String(v ?? "").trim();
  return s !== "" && s !== "0";
};

/** Formats numeric input as "Rs 15,000"; returns text labels untouched. */
export const formatPrice = (v: unknown): string => {
  const s = String(v ?? "").trim();
  if (!hasPrice(s)) return "";
  // Digits (with optional separators/decimals) only — treat as an amount.
  if (/^[\d.,\s]+$/.test(s)) {
    const n = Number(s.replace(/[,\s]/g, ""));
    if (Number.isFinite(n)) return `Rs ${n.toLocaleString()}`;
  }
  return s;
};

/** Show a struck-through compare-at price only when it differs meaningfully. */
export const hasCompareAt = (original: unknown, price: unknown): boolean =>
  hasPrice(original) && String(original).trim() !== String(price ?? "").trim();
