import {
  findProvince,
  findProvinceByZipcode,
  findSubDistrict,
  getProvinceByCode,
  type Province,
  type SubDistrict,
} from "../geography/index.js";

export interface ParsedThaiAddress {
  /** Original input string, trimmed. */
  raw: string;
  houseNumber?: string;
  /** ชื่ออาคาร/ตึก */
  building?: string;
  /** ชั้นที่ */
  floor?: string;
  /** เลขห้อง */
  room?: string;
  /** ชื่อหมู่บ้าน/village name */
  village?: string;
  moo?: string;
  soi?: string;
  /** แยก (intersection/junction name) */
  yaek?: string;
  road?: string;
  /** ตำบล/แขวง */
  subDistrict?: string;
  /** อำเภอ/เขต */
  district?: string;
  province?: string;
  postalCode?: string;
  /** ตู้ ปณ. (post office box number), when present. */
  poBox?: string;
  /** Resolved province record, when the parsed province name matched the geography dataset. */
  provinceInfo?: Province;
  /** Resolved sub-district record, when subDistrict+district matched the geography dataset. */
  subDistrictInfo?: SubDistrict;
  /** True if every core component (subDistrict, district, province, postalCode) was found. */
  isComplete: boolean;
}

interface ExtractResult {
  value?: string;
  rest: string;
}

/** Extract text following any of the given Thai keyword prefixes, stopping at the next keyword or end of string. */
function extractField(text: string, keywords: string[], stopKeywords: string[]): ExtractResult {
  for (const keyword of keywords) {
    const idx = text.indexOf(keyword);
    if (idx === -1) continue;

    const afterKeyword = idx + keyword.length;
    let end = text.length;
    for (const stop of stopKeywords) {
      const stopIdx = text.indexOf(stop, afterKeyword);
      if (stopIdx !== -1 && stopIdx < end) end = stopIdx;
    }

    const value = text.slice(afterKeyword, end).trim();
    const rest = (text.slice(0, idx) + " " + text.slice(end)).trim();
    return { value: value || undefined, rest };
  }
  return { rest: text };
}

const SUB_DISTRICT_KEYWORDS = ["ตำบล", "ต.", "แขวง"];
const DISTRICT_KEYWORDS = ["อำเภอ", "อ.", "เขต"];
const PROVINCE_KEYWORDS = ["จังหวัด", "จ."];
const ROAD_KEYWORDS = ["ถนน", "ถ."];
const SOI_KEYWORDS = ["ซอย", "ซ."];
const YAEK_KEYWORDS = ["แยก"];
// "หมู่บ้าน" must be extracted before MOO_KEYWORDS since it contains "หมู่" as a substring.
const VILLAGE_KEYWORDS = ["หมู่บ้าน"];
const MOO_KEYWORDS = ["หมู่ที่", "หมู่", "ม."];
const BUILDING_KEYWORDS = ["อาคาร", "ตึก"];
const FLOOR_KEYWORDS = ["ชั้นที่", "ชั้น"];
const ROOM_KEYWORDS = ["ห้องเลขที่", "ห้องที่", "ห้อง"];
const POBOX_KEYWORDS = ["ตู้ ปณ.", "ตู้ปณ.", "ตู้ ป.ณ.", "ตู้ป.ณ."];
// "บ้านเลขที่" must come before "เลขที่" since it contains "เลขที่" as a substring.
const HOUSE_KEYWORDS = ["บ้านเลขที่", "เลขที่"];

const ALL_KEYWORDS = [
  ...SUB_DISTRICT_KEYWORDS,
  ...DISTRICT_KEYWORDS,
  ...PROVINCE_KEYWORDS,
  ...ROAD_KEYWORDS,
  ...SOI_KEYWORDS,
  ...YAEK_KEYWORDS,
  ...VILLAGE_KEYWORDS,
  ...MOO_KEYWORDS,
  ...BUILDING_KEYWORDS,
  ...FLOOR_KEYWORDS,
  ...ROOM_KEYWORDS,
  ...POBOX_KEYWORDS,
];

/**
 * Parse a free-form Thai postal address string into its structured
 * components (house number, building/floor/room, village, moo, soi, yaek,
 * road, sub-district, district, province, postal code, PO box). Uses
 * keyword-anchored extraction, so it works best on addresses that include
 * the standard ตำบล/อำเภอ/จังหวัด (or Bangkok's แขวง/เขต) markers. When the
 * province is omitted (no "จังหวัด"/"จ." keyword and not Bangkok), a
 * trailing bare province name — as in "อำเภอเมืองขอนแก่น ขอนแก่น" — is also
 * recognized.
 */
export function parseThaiAddress(input: string): ParsedThaiAddress {
  const raw = input.trim().replace(/\s+/g, " ");
  let remaining = raw;

  const postalMatch = remaining.match(/(\d{5})\s*$/);
  let postalCode = postalMatch?.[1];
  if (postalMatch) {
    remaining = remaining.slice(0, postalMatch.index).trim();
  }

  const provinceResult = extractField(remaining, PROVINCE_KEYWORDS, []);
  remaining = provinceResult.rest;
  let province = provinceResult.value;

  // Bangkok addresses often omit "จังหวัด" and just say "กรุงเทพมหานคร" / "กทม."
  if (!province) {
    const bkkMatch = remaining.match(/(กรุงเทพมหานคร|กรุงเทพฯ|กทม\.?)/);
    if (bkkMatch) {
      province = "กรุงเทพมหานคร";
      remaining = remaining.replace(bkkMatch[0], "").trim();
    }
  }

  const districtResult = extractField(remaining, DISTRICT_KEYWORDS, PROVINCE_KEYWORDS);
  remaining = districtResult.rest;
  let district = districtResult.value;

  // No explicit province keyword and not Bangkok: check whether the district
  // capture ran on to swallow a bare trailing province name, e.g.
  // "อำเภอเมืองขอนแก่น ขอนแก่น" -> district "เมืองขอนแก่น", province "ขอนแก่น".
  if (!province && district) {
    const tokens = district.split(/\s+/).filter(Boolean);
    for (let take = 1; take <= Math.min(3, tokens.length - 1); take++) {
      const candidate = tokens.slice(tokens.length - take).join(" ");
      const match = findProvince(candidate);
      if (match) {
        province = match.nameTh;
        district = tokens.slice(0, tokens.length - take).join(" ");
        break;
      }
    }
  }

  const subDistrictResult = extractField(remaining, SUB_DISTRICT_KEYWORDS, [
    ...DISTRICT_KEYWORDS,
    ...PROVINCE_KEYWORDS,
  ]);
  remaining = subDistrictResult.rest;

  const roadResult = extractField(remaining, ROAD_KEYWORDS, [
    ...SUB_DISTRICT_KEYWORDS,
    ...DISTRICT_KEYWORDS,
    ...PROVINCE_KEYWORDS,
  ]);
  remaining = roadResult.rest;

  const poBoxResult = extractField(remaining, POBOX_KEYWORDS, ALL_KEYWORDS);
  remaining = poBoxResult.rest;
  const poBox = poBoxResult.value?.match(/\d+/)?.[0] ?? poBoxResult.value;

  const soiResult = extractField(remaining, SOI_KEYWORDS, ALL_KEYWORDS);
  remaining = soiResult.rest;

  const yaekResult = extractField(remaining, YAEK_KEYWORDS, ALL_KEYWORDS);
  remaining = yaekResult.rest;

  const villageResult = extractField(remaining, VILLAGE_KEYWORDS, ALL_KEYWORDS);
  remaining = villageResult.rest;

  const mooResult = extractField(remaining, MOO_KEYWORDS, ALL_KEYWORDS);
  remaining = mooResult.rest;

  const roomResult = extractField(remaining, ROOM_KEYWORDS, ALL_KEYWORDS);
  remaining = roomResult.rest;

  const floorResult = extractField(remaining, FLOOR_KEYWORDS, ALL_KEYWORDS);
  remaining = floorResult.rest;

  const buildingResult = extractField(remaining, BUILDING_KEYWORDS, ALL_KEYWORDS);
  remaining = buildingResult.rest;

  // Whatever numeric text remains at the front is the house number, with an
  // optional house-number keyword prefix (HOUSE_KEYWORDS).
  const houseKeywordPattern = HOUSE_KEYWORDS.join("|");
  const houseMatch = remaining.trim().match(new RegExp(`^(?:${houseKeywordPattern})?\\s*([\\d/,-]+)`));
  const houseNumber = houseMatch?.[1];

  let provinceInfo = province
    ? findProvince(province) ?? (postalCode ? findProvinceByZipcode(postalCode) : undefined)
    : postalCode
      ? findProvinceByZipcode(postalCode)
      : undefined;

  const subDistrictInfo = subDistrictResult.value
    ? findSubDistrict(subDistrictResult.value, district)
    : undefined;

  // Fill in province/postal code from the precise sub-district record when the
  // input omitted them or they weren't recognized directly.
  if (subDistrictInfo) {
    if (!provinceInfo) provinceInfo = getProvinceByCode(subDistrictInfo.provinceCode);
    if (!province) province = provinceInfo?.nameTh;
    if (!postalCode) postalCode = subDistrictInfo.zipcode;
  }

  const result: ParsedThaiAddress = {
    raw,
    houseNumber,
    building: buildingResult.value,
    floor: floorResult.value,
    room: roomResult.value,
    village: villageResult.value,
    moo: mooResult.value,
    soi: soiResult.value,
    yaek: yaekResult.value,
    road: roadResult.value,
    subDistrict: subDistrictResult.value,
    district,
    province,
    postalCode,
    poBox,
    provinceInfo,
    subDistrictInfo,
    isComplete: Boolean(subDistrictResult.value && district && province && postalCode),
  };

  return result;
}

export interface ThaiAddressParts {
  houseNumber?: string;
  building?: string;
  floor?: string;
  room?: string;
  village?: string;
  moo?: string;
  soi?: string;
  yaek?: string;
  road?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

const BANGKOK_NAMES = new Set(["กรุงเทพมหานคร", "กรุงเทพฯ", "กรุงเทพ", "กทม."]);

/**
 * Build a canonical Thai address string from structured parts — the
 * reverse of {@link parseThaiAddress}. Uses แขวง/เขต for Bangkok and
 * ตำบล/อำเภอ/จังหวัด elsewhere.
 */
export function formatThaiAddress(parts: ThaiAddressParts): string {
  const isBangkok = BANGKOK_NAMES.has(parts.province.trim());
  const segments: string[] = [];

  if (parts.houseNumber) segments.push(parts.houseNumber);
  if (parts.building) segments.push(`อาคาร${parts.building}`);
  if (parts.floor) segments.push(`ชั้น${parts.floor}`);
  if (parts.room) segments.push(`ห้อง${parts.room}`);
  if (parts.village) segments.push(`หมู่บ้าน${parts.village}`);
  if (parts.moo) segments.push(`หมู่ ${parts.moo}`);
  if (parts.soi) segments.push(`ซอย${parts.soi}`);
  if (parts.yaek) segments.push(`แยก${parts.yaek}`);
  if (parts.road) segments.push(`ถนน${parts.road}`);

  segments.push(isBangkok ? `แขวง${parts.subDistrict}` : `ตำบล${parts.subDistrict}`);
  segments.push(isBangkok ? `เขต${parts.district}` : `อำเภอ${parts.district}`);
  segments.push(isBangkok ? parts.province : `จังหวัด${parts.province}`);
  segments.push(parts.postalCode);

  return segments.join(" ");
}
