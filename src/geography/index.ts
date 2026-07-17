import { PROVINCES, PROVINCES_BY_CODE, type Province, type ThaiRegion } from "./data.js";
import { DISTRICTS, type District } from "./districts.js";
import { SUBDISTRICTS, type SubDistrict } from "./subdistricts.js";

export type { Province, ThaiRegion };
export { PROVINCES };
export type { District } from "./districts.js";
export { DISTRICTS } from "./districts.js";
export type { SubDistrict } from "./subdistricts.js";
export { SUBDISTRICTS } from "./subdistricts.js";

export const REGIONS: ThaiRegion[] = [
  "north",
  "northeast",
  "central",
  "east",
  "west",
  "south",
];

const REGION_LABELS_TH: Record<ThaiRegion, string> = {
  north: "ภาคเหนือ",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};

function stripProvincePrefix(name: string): string {
  return name.trim().replace(/^จังหวัด\s*/, "");
}

/** Look up a province by Thai or English name (case-insensitive, "จังหวัด" prefix optional). */
export function findProvince(name: string): Province | undefined {
  const thaiTarget = stripProvincePrefix(name);
  const enTarget = thaiTarget.toLowerCase();
  return PROVINCES.find(
    (p) => p.nameTh === thaiTarget || p.nameEn.toLowerCase() === enTarget,
  );
}

export function getProvinceByCode(code: string): Province | undefined {
  return PROVINCES_BY_CODE[code];
}

export function getProvincesByRegion(region: ThaiRegion): Province[] {
  return PROVINCES.filter((p) => p.region === region);
}

export function getRegionLabel(region: ThaiRegion): string {
  return REGION_LABELS_TH[region];
}

/**
 * Province lookup from a zipcode. Uses the precise sub-district zipcode data
 * where available, falling back to the province-level prefix table.
 */
export function findProvinceByZipcode(zipcode: string): Province | undefined {
  const zip = zipcode.trim();
  const exact = SUBDISTRICTS.find((s) => s.zipcode === zip);
  if (exact) {
    return getProvinceByCode(exact.provinceCode);
  }
  return PROVINCES.find((p) => p.zipcodePrefixes.some((prefix) => zip.startsWith(prefix)));
}

export function isValidProvinceName(name: string): boolean {
  return findProvince(name) !== undefined;
}

// District names in the dataset carry their "เขต"/"อำเภอ" prefix (e.g. "เขตพญาไท"),
// but callers — like the address parser, which strips keyword prefixes during
// extraction — often pass the bare name (e.g. "พญาไท"). Strip both sides before
// comparing so either form matches.
function stripDistrictPrefix(name: string): string {
  return name.replace(/^(เขต|อำเภอ|อ\.)\s*/, "");
}

/** Look up a district by Thai or English name, optionally scoped to a province code. */
export function findDistrict(name: string, provinceCode?: string): District | undefined {
  const target = name.trim();
  const targetLower = target.toLowerCase();
  const targetBare = stripDistrictPrefix(target);
  return DISTRICTS.find(
    (d) =>
      (d.nameTh === target ||
        stripDistrictPrefix(d.nameTh) === targetBare ||
        d.nameEn.toLowerCase() === targetLower) &&
      (provinceCode === undefined || d.provinceCode === provinceCode),
  );
}

/** Look up a sub-district by Thai or English name, optionally scoped to a district name. */
export function findSubDistrict(name: string, districtName?: string): SubDistrict | undefined {
  const target = name.trim();
  const targetLower = target.toLowerCase();
  const districtBare = districtName !== undefined ? stripDistrictPrefix(districtName.trim()) : undefined;
  return SUBDISTRICTS.find(
    (s) =>
      (s.nameTh === target || s.nameEn.toLowerCase() === targetLower) &&
      (districtBare === undefined || stripDistrictPrefix(s.districtNameTh) === districtBare),
  );
}

export function getDistrictsByProvince(provinceCode: string): District[] {
  return DISTRICTS.filter((d) => d.provinceCode === provinceCode);
}

export function getSubDistrictsByDistrict(districtNameTh: string, provinceCode: string): SubDistrict[] {
  const target = stripDistrictPrefix(districtNameTh.trim());
  return SUBDISTRICTS.filter(
    (s) => stripDistrictPrefix(s.districtNameTh) === target && s.provinceCode === provinceCode,
  );
}

/** A zipcode can map to multiple sub-districts, so this returns all matches. */
export function findSubDistrictByZipcode(zipcode: string): SubDistrict[] {
  const zip = zipcode.trim();
  return SUBDISTRICTS.filter((s) => s.zipcode === zip);
}
