/**
 * Returns true if the string contains any Arabic Unicode characters.
 */
export function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u0870-\u089F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}
