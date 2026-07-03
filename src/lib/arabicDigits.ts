const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Convert a Latin integer to Arabic-Indic digits (e.g. 42 → ٤٢). */
export function toArabicIndic(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]);
}
