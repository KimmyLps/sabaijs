import { describe, expect, it } from "vitest";
import {
  DISTRICTS,
  findDistrict,
  findProvince,
  findProvinceByZipcode,
  findSubDistrict,
  findSubDistrictByZipcode,
  getDistrictsByProvince,
  getProvincesByRegion,
  getSubDistrictsByDistrict,
  PROVINCES,
  SUBDISTRICTS,
} from "../src/geography/index.js";

describe("geography", () => {
  it("has all 77 provinces", () => {
    expect(PROVINCES.length).toBe(77);
  });

  it("finds a province by Thai or English name", () => {
    expect(findProvince("เชียงใหม่")?.nameEn).toBe("Chiang Mai");
    expect(findProvince("chiang mai")?.nameTh).toBe("เชียงใหม่");
    expect(findProvince("จังหวัดภูเก็ต")?.nameEn).toBe("Phuket");
  });

  it("groups provinces by region", () => {
    const south = getProvincesByRegion("south");
    expect(south.some((p) => p.nameEn === "Phuket")).toBe(true);
    expect(south.every((p) => p.region === "south")).toBe(true);
  });

  it("finds a province by zipcode prefix", () => {
    expect(findProvinceByZipcode("50200")?.nameEn).toBe("Chiang Mai");
  });

  it("has a full set of districts and sub-districts", () => {
    expect(DISTRICTS.length).toBeGreaterThan(900);
    expect(SUBDISTRICTS.length).toBeGreaterThan(7000);
  });

  it("finds a well-known district by Thai or English name", () => {
    expect(findDistrict("เขตพระนคร")?.nameEn).toBe("Khet Phra Nakhon");
    expect(findDistrict("Khet Phra Nakhon", "10")?.nameTh).toBe("เขตพระนคร");
  });

  it("finds districts scoped to a province", () => {
    const bangkokDistricts = getDistrictsByProvince("10");
    expect(bangkokDistricts.length).toBeGreaterThan(40);
    expect(bangkokDistricts.every((d) => d.provinceCode === "10")).toBe(true);
  });

  it("finds a well-known sub-district by Thai or English name", () => {
    const subDistrict = findSubDistrict("พระบรมมหาราชวัง");
    expect(subDistrict?.nameEn).toBe("Phra Borom Maha Ratchawang");
    expect(subDistrict?.zipcode).toBe("10200");
  });

  it("finds sub-districts scoped to a district", () => {
    const subDistricts = getSubDistrictsByDistrict("เขตพระนคร", "10");
    expect(subDistricts.length).toBeGreaterThan(0);
    expect(subDistricts.every((s) => s.districtNameTh === "เขตพระนคร")).toBe(true);
  });

  it("finds sub-districts by exact zipcode (possibly multiple)", () => {
    const results = findSubDistrictByZipcode("10200");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((s) => s.zipcode === "10200")).toBe(true);
  });
});
