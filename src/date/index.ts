const BE_OFFSET = 543;

export const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export const THAI_WEEKDAYS_FULL = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์",
];

export const THAI_WEEKDAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/** Convert a Gregorian (Christian Era) year to Buddhist Era. */
export function toBuddhistYear(ceYear: number): number {
  return ceYear + BE_OFFSET;
}

/** Convert a Buddhist Era year to Gregorian (Christian Era). */
export function toChristianYear(beYear: number): number {
  return beYear - BE_OFFSET;
}

export interface ThaiDateFormatOptions {
  /** "full" for วันจันทร์, "short" for จ., omit for no weekday. */
  weekday?: "full" | "short";
  /** "full" for มกราคม, "short" for ม.ค. (default: "full") */
  monthStyle?: "full" | "short";
}

/** Format a Date as a Thai date string using the Buddhist Era, e.g. "14 กรกฎาคม 2569". */
export function formatThaiDate(date: Date, options: ThaiDateFormatOptions = {}): string {
  const { weekday, monthStyle = "full" } = options;
  const day = date.getDate();
  const months = monthStyle === "short" ? THAI_MONTHS_SHORT : THAI_MONTHS_FULL;
  const month = months[date.getMonth()];
  const year = toBuddhistYear(date.getFullYear());

  const datePart = `${day} ${month} ${year}`;
  if (!weekday) return datePart;

  const weekdays = weekday === "short" ? THAI_WEEKDAYS_SHORT : THAI_WEEKDAYS_FULL;
  return `${weekdays[date.getDay()]}ที่ ${datePart}`;
}

/**
 * Parse a Thai-formatted date string like "14/07/2569" or "14 กรกฎาคม 2569"
 * (Buddhist Era) into a native Date. Returns null if unparseable.
 */
export function parseThaiDate(input: string): Date | null {
  const trimmed = input.trim();

  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (numeric) {
    const [, d, m, y] = numeric;
    const ceYear = toChristianYear(Number(y));
    const date = new Date(ceYear, Number(m) - 1, Number(d));
    return isValidDate(date) ? date : null;
  }

  const monthNames = [...THAI_MONTHS_FULL, ...THAI_MONTHS_SHORT];
  const textual = trimmed.match(/^(\d{1,2})\s+([ก-๙.]+)\s+(\d{4})$/);
  if (textual) {
    const [, d, monthText, y] = textual;
    let monthIndex = THAI_MONTHS_FULL.indexOf(monthText);
    if (monthIndex === -1) monthIndex = THAI_MONTHS_SHORT.indexOf(monthText);
    if (monthIndex === -1) return null;
    const ceYear = toChristianYear(Number(y));
    const date = new Date(ceYear, monthIndex, Number(d));
    return isValidDate(date) ? date : null;
  }

  return null;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

/** Number of full years between two dates (defaults to now). */
export function calculateAge(birthDate: Date, at: Date = new Date()): number {
  let age = at.getFullYear() - birthDate.getFullYear();
  const monthDiff = at.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
