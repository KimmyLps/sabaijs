import { describe, expect, it } from "vitest";
import {
  addDays,
  calculateAge,
  formatThaiDate,
  parseThaiDate,
  toBuddhistYear,
  toChristianYear,
} from "../src/date/index.js";

describe("Buddhist Era conversion", () => {
  it("converts CE to BE and back", () => {
    expect(toBuddhistYear(2026)).toBe(2569);
    expect(toChristianYear(2569)).toBe(2026);
  });
});

describe("formatThaiDate", () => {
  it("formats a date with full month name and BE year", () => {
    const date = new Date(2026, 6, 14); // July 14, 2026
    expect(formatThaiDate(date)).toBe("14 กรกฎาคม 2569");
  });

  it("includes weekday when requested", () => {
    const date = new Date(2026, 6, 14);
    expect(formatThaiDate(date, { weekday: "full" })).toContain("ที่ 14 กรกฎาคม 2569");
  });
});

describe("parseThaiDate", () => {
  it("parses numeric dd/mm/yyyy (BE)", () => {
    const date = parseThaiDate("14/07/2569");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(14);
  });

  it("parses textual dd month yyyy (BE)", () => {
    const date = parseThaiDate("14 กรกฎาคม 2569");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
  });

  it("returns null for unparseable input", () => {
    expect(parseThaiDate("not a date")).toBeNull();
  });
});

describe("calculateAge", () => {
  it("computes full years elapsed", () => {
    const birth = new Date(2000, 0, 1);
    const at = new Date(2026, 0, 1);
    expect(calculateAge(birth, at)).toBe(26);
  });
});

describe("addDays", () => {
  it("adds days without mutating the input", () => {
    const start = new Date(2026, 0, 1);
    const result = addDays(start, 10);
    expect(result.getDate()).toBe(11);
    expect(start.getDate()).toBe(1);
  });
});
