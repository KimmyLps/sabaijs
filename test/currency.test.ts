import { describe, expect, it } from "vitest";
import { numberToEnglishWords, parseBahtText, toBahtText, toBahtTextEn } from "../src/currency/index.js";

describe("toBahtText", () => {
  it("reads whole baht amounts", () => {
    expect(toBahtText(1)).toBe("หนึ่งบาทถ้วน");
    expect(toBahtText(21)).toBe("ยี่สิบเอ็ดบาทถ้วน");
    expect(toBahtText(100)).toBe("หนึ่งร้อยบาทถ้วน");
    expect(toBahtText(1234567)).toBe("หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทถ้วน");
  });

  it("reads baht with satang", () => {
    expect(toBahtText(1234.5)).toBe("หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์");
  });

  it("reads zero", () => {
    expect(toBahtText(0)).toBe("ศูนย์บาทถ้วน");
  });

  it("marks negative amounts", () => {
    expect(toBahtText(-5)).toBe("ลบห้าบาทถ้วน");
  });
});

describe("parseBahtText", () => {
  it("round-trips values produced by toBahtText", () => {
    for (const amount of [0, 1, 21, 100, 1234.5, 1234567, -5]) {
      expect(parseBahtText(toBahtText(amount))).toBe(amount);
    }
  });

  it("parses baht text directly", () => {
    expect(parseBahtText("หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์")).toBe(1234.5);
    expect(parseBahtText("ศูนย์บาทถ้วน")).toBe(0);
  });

  it("throws on unparseable text", () => {
    expect(() => parseBahtText("not thai text")).toThrow();
  });
});

describe("numberToEnglishWords", () => {
  it("converts numbers to English words", () => {
    expect(numberToEnglishWords(0)).toBe("Zero");
    expect(numberToEnglishWords(21)).toBe("Twenty-One");
    expect(numberToEnglishWords(8500)).toBe("Eight Thousand Five Hundred");
    expect(numberToEnglishWords(1234567)).toBe("One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven");
  });
});

describe("toBahtTextEn", () => {
  it("reads amounts in English", () => {
    expect(toBahtTextEn(8500)).toBe("Eight Thousand Five Hundred Baht");
    expect(toBahtTextEn(1234.5)).toBe("One Thousand Two Hundred Thirty-Four Baht and Fifty Satang");
  });
});
