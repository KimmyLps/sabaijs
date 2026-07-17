import { describe, expect, it } from "vitest";
import {
  findBank,
  formatBankAccountNumber,
  generatePromptPayPayload,
  isValidBankAccountNumber,
} from "../src/bank/index.js";

describe("bank", () => {
  it("finds a bank by code", () => {
    expect(findBank("004")?.nameEn).toBe("Kasikornbank");
    expect(findBank("999")).toBeUndefined();
  });

  it("validates bank account numbers", () => {
    expect(isValidBankAccountNumber("123-4-56789-0")).toBe(true);
    expect(isValidBankAccountNumber("123")).toBe(false);
  });

  it("formats an account number using the bank's grouping", () => {
    expect(formatBankAccountNumber("1234567890", "004")).toBe("123-4-56789-0");
  });

  it("falls back to the default 10-digit grouping when bankCode is unknown", () => {
    expect(formatBankAccountNumber("1234567890")).toBe("123-4-56789-0");
    expect(formatBankAccountNumber("123-456-789-0", "030")).toBe("123-4-56789-0");
  });

  it("returns plain digits when the length doesn't match any known grouping", () => {
    expect(formatBankAccountNumber("12345")).toBe("12345");
  });

  describe("generatePromptPayPayload", () => {
    it("encodes a mobile number as a static (any-amount) payload", () => {
      const payload = generatePromptPayPayload("081-234-5678");
      expect(payload).toContain("000201"); // payload format indicator
      expect(payload).toContain("010211"); // static point of initiation
      expect(payload).toContain("A000000677010111");
      expect(payload).toContain("0113006681234567"); // sub-tag 01, len 13, 0066 + 812345678
      expect(payload).toContain("5303764"); // THB currency code
      expect(payload).toContain("5802TH");
      expect(payload).not.toMatch(/5406|5407|5408|54\d\d\d/); // no amount tag
    });

    it("encodes a citizen/tax ID as sub-tag 02", () => {
      const payload = generatePromptPayPayload("3101234567890");
      expect(payload).toContain("02133101234567890");
    });

    it("switches to a dynamic (fixed-amount) payload and includes the amount tag", () => {
      const payload = generatePromptPayPayload("0812345678", 100);
      expect(payload).toContain("010212"); // dynamic point of initiation
      expect(payload).toContain("5406100.00"); // tag 54, len 6, value "100.00"
    });

    it("appends a valid 4-hex-digit CRC16 checksum as the final tag", () => {
      const payload = generatePromptPayPayload("0812345678");
      expect(payload).toMatch(/6304[0-9A-F]{4}$/);
    });

    it("rejects an invalid target", () => {
      expect(() => generatePromptPayPayload("12345")).toThrow();
    });

    it("rejects a non-positive amount", () => {
      expect(() => generatePromptPayPayload("0812345678", 0)).toThrow();
      expect(() => generatePromptPayPayload("0812345678", -5)).toThrow();
    });
  });
});
