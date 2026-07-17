const ARABIC_TO_THAI: Record<string, string> = {
  "0": "๐", "1": "๑", "2": "๒", "3": "๓", "4": "๔",
  "5": "๕", "6": "๖", "7": "๗", "8": "๘", "9": "๙",
};
const THAI_TO_ARABIC = Object.fromEntries(Object.entries(ARABIC_TO_THAI).map(([a, t]) => [t, a]));

/** Convert Arabic digits (0-9) in a string to Thai numerals (๐-๙). */
export function toThaiNumerals(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => ARABIC_TO_THAI[d]);
}

/** Convert Thai numerals (๐-๙) in a string to Arabic digits (0-9). */
export function toArabicNumerals(input: string): string {
  return input.replace(/[๐-๙]/g, (d) => THAI_TO_ARABIC[d]);
}

let thaiCollator: Intl.Collator | undefined;
function getThaiCollator(): Intl.Collator {
  return (thaiCollator ??= new Intl.Collator("th"));
}

/** Sort strings (or objects via a key selector) using Thai dictionary order. */
export function sortThai<T>(items: T[], selector?: (item: T) => string): T[] {
  const collator = getThaiCollator();
  return [...items].sort((a, b) => collator.compare(selector ? selector(a) : String(a), selector ? selector(b) : String(b)));
}
