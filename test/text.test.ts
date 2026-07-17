import { describe, expect, it } from "vitest";
import { sortThai, toArabicNumerals, toThaiNumerals } from "../src/text/index.js";

describe("numeral conversion", () => {
  it("converts arabic to thai numerals", () => {
    expect(toThaiNumerals(2569)).toBe("๒๕๖๙");
    expect(toThaiNumerals("2569")).toBe("๒๕๖๙");
  });

  it("converts thai to arabic numerals", () => {
    expect(toArabicNumerals("๒๕๖๙")).toBe("2569");
  });
});

describe("sortThai", () => {
  it("sorts strings in Thai dictionary order", () => {
    const result = sortThai(["ไก่", "ขวด", "อ่าง"]);
    expect(result).toEqual(["ไก่", "ขวด", "อ่าง"]);
  });

  it("sorts objects via a key selector", () => {
    const people = [{ name: "ขวด" }, { name: "ไก่" }, { name: "อ่าง" }];
    const result = sortThai(people, (p) => p.name).map((p) => p.name);
    expect(result).toEqual(["ไก่", "ขวด", "อ่าง"]);
  });
});
