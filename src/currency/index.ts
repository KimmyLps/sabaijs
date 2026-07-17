const DIGITS = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const PLACES = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

function readTriplet(digits: string): string {
  let result = "";
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const digit = Number(digits[i]);
    const place = len - i - 1;
    if (digit === 0) continue;

    if (place === 0 && digit === 1 && len > 1) {
      result += "เอ็ด";
    } else if (place === 1 && digit === 1) {
      result += "สิบ";
    } else if (place === 1 && digit === 2) {
      result += "ยี่สิบ";
    } else {
      result += DIGITS[digit] + PLACES[place];
    }
  }
  return result;
}

/** Convert a positive integer string into its Thai number reading (no currency unit). */
function readNumber(value: string): string {
  const digits = value.replace(/^0+(?=\d)/, "");
  if (digits === "0") return DIGITS[0];

  let result = "";
  let remaining = digits;
  const millionGroups: string[] = [];
  while (remaining.length > 6) {
    millionGroups.unshift(remaining.slice(-6));
    remaining = remaining.slice(0, -6);
  }
  millionGroups.unshift(remaining);

  for (let i = 0; i < millionGroups.length; i++) {
    const group = millionGroups[i].replace(/^0+(?=\d)/, "");
    if (group === "0" || group === "") continue;
    result += readTriplet(group) + (i < millionGroups.length - 1 ? "ล้าน" : "");
  }
  return result;
}

/**
 * Convert a number to its Thai baht text reading, e.g. 1234.50 -> "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์".
 * Rounds to the nearest satang (2 decimal places).
 */
export function toBahtText(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const negative = amount < 0;
  const rounded = Math.round(Math.abs(amount) * 100);
  const baht = Math.floor(rounded / 100);
  const satang = rounded % 100;

  const bahtText = `${readNumber(String(baht))}บาท`;
  const satangText = satang === 0 ? "ถ้วน" : `${readNumber(String(satang))}สตางค์`;

  return (negative ? "ลบ" : "") + bahtText + satangText;
}

const BIG_PLACES: Array<[number, string]> = [[5, "แสน"], [4, "หมื่น"], [3, "พัน"], [2, "ร้อย"]];

/** Parse a group of at most 6 digits worth of Thai number text (no ล้าน). */
function parseGroupText(text: string): number {
  if (text === "" || text === DIGITS[0]) return 0;

  let remaining = text;
  let value = 0;

  for (const [place, word] of BIG_PLACES) {
    for (let d = 9; d >= 1; d--) {
      const token = DIGITS[d] + word;
      if (remaining.startsWith(token)) {
        value += d * 10 ** place;
        remaining = remaining.slice(token.length);
        break;
      }
    }
  }

  if (remaining.startsWith("ยี่สิบ")) {
    value += 20;
    remaining = remaining.slice("ยี่สิบ".length);
  } else if (remaining.startsWith("สิบ")) {
    value += 10;
    remaining = remaining.slice("สิบ".length);
  } else {
    for (let d = 9; d >= 3; d--) {
      const token = DIGITS[d] + "สิบ";
      if (remaining.startsWith(token)) {
        value += d * 10;
        remaining = remaining.slice(token.length);
        break;
      }
    }
  }

  if (remaining.startsWith("เอ็ด")) {
    value += 1;
    remaining = remaining.slice("เอ็ด".length);
  } else if (remaining !== "") {
    const digit = DIGITS.indexOf(remaining);
    if (digit === -1) throw new Error(`Unable to parse Thai number text near "${remaining}"`);
    value += digit;
    remaining = "";
  }

  if (remaining !== "") throw new Error(`Unable to parse Thai number text near "${remaining}"`);
  return value;
}

/**
 * Parse Thai baht text (as produced by {@link toBahtText}) back into a number,
 * e.g. "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์" -> 1234.5.
 */
export function parseBahtText(text: string): number {
  const trimmed = text.trim();
  const negative = trimmed.startsWith("ลบ");
  const unsigned = negative ? trimmed.slice("ลบ".length) : trimmed;

  const bahtIndex = unsigned.indexOf("บาท");
  if (bahtIndex === -1) throw new Error(`Invalid baht text: "${text}"`);

  const bahtPart = unsigned.slice(0, bahtIndex);
  const rest = unsigned.slice(bahtIndex + "บาท".length);

  const groups = bahtPart.split("ล้าน");
  let baht = 0;
  for (let i = 0; i < groups.length; i++) {
    const multiplier = 10 ** (6 * (groups.length - 1 - i));
    baht += parseGroupText(groups[i]) * multiplier;
  }

  let satang = 0;
  if (rest === "ถ้วน") {
    satang = 0;
  } else if (rest.endsWith("สตางค์")) {
    satang = parseGroupText(rest.slice(0, -"สตางค์".length));
  } else {
    throw new Error(`Invalid baht text: "${text}"`);
  }

  const amount = baht + satang / 100;
  return negative ? -amount : amount;
}

const EN_ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const EN_SCALES = ["", "Thousand", "Million", "Billion"];

function readEnglishHundreds(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${EN_ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    const tens = EN_TENS[Math.floor(n / 10)];
    const ones = n % 10;
    parts.push(ones > 0 ? `${tens}-${EN_ONES[ones]}` : tens);
  } else if (n > 0) {
    parts.push(EN_ONES[n]);
  }
  return parts.join(" ");
}

/** Convert a non-negative integer to its English word reading, e.g. 8500 -> "Eight Thousand Five Hundred". */
export function numberToEnglishWords(value: number): string {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Expected a non-negative integer, got ${value}`);
  }
  if (value === 0) return "Zero";

  const groups: number[] = [];
  let remaining = value;
  while (remaining > 0) {
    groups.unshift(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  if (groups.length > EN_SCALES.length) {
    throw new Error(`Value too large to convert: ${value}`);
  }

  const parts: string[] = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (group === 0) continue;
    const scale = EN_SCALES[groups.length - i - 1];
    parts.push(scale ? `${readEnglishHundreds(group)} ${scale}` : readEnglishHundreds(group));
  }
  return parts.join(" ");
}

/**
 * Convert a number to its English baht reading, e.g. 8500 -> "Eight Thousand Five Hundred Baht".
 * Rounds to the nearest satang (2 decimal places).
 */
export function toBahtTextEn(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const negative = amount < 0;
  const rounded = Math.round(Math.abs(amount) * 100);
  const baht = Math.floor(rounded / 100);
  const satang = rounded % 100;

  const bahtText = `${numberToEnglishWords(baht)} Baht`;
  const satangText = satang === 0 ? "" : ` and ${numberToEnglishWords(satang)} Satang`;

  return (negative ? "Negative " : "") + bahtText + satangText;
}
