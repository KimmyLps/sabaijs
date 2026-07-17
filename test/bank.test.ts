import { describe, expect, it } from "vitest";
import { findBank, formatBankAccountNumber, isValidBankAccountNumber } from "../src/bank/index.js";

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
});
