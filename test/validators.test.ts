import { describe, expect, it } from "vitest";
import {
  formatCitizenId,
  formatPhoneNumber,
  isValidCitizenId,
  isValidEmail,
  isValidLandlinePhone,
  isValidMobilePhone,
  isValidPostalCode,
  isValidVatId,
} from "../src/validators/index.js";

describe("citizen ID", () => {
  it("accepts a valid checksum", () => {
    expect(isValidCitizenId("1101700207366")).toBe(true);
    expect(isValidCitizenId("110-1700-207-36-6")).toBe(true);
  });

  it("rejects invalid checksum or shape", () => {
    expect(isValidCitizenId("1101700207367")).toBe(false);
    expect(isValidCitizenId("123")).toBe(false);
  });

  it("formats with dashes", () => {
    expect(formatCitizenId("1101700207366")).toBe("1-1017-00207-36-6");
  });
});

describe("phone numbers", () => {
  it("validates mobile numbers", () => {
    expect(isValidMobilePhone("0812345678")).toBe(true);
    expect(isValidMobilePhone("081-234-5678")).toBe(true);
    expect(isValidMobilePhone("0212345678")).toBe(false);
  });

  it("validates landline numbers", () => {
    expect(isValidLandlinePhone("021234567")).toBe(true);
    expect(isValidLandlinePhone("0812345678")).toBe(false);
  });

  it("formats mobile and landline numbers with dashes", () => {
    expect(formatPhoneNumber("0812345678")).toBe("081-234-5678");
    expect(formatPhoneNumber("021234567")).toBe("02-123-4567");
  });

  it("throws when formatting an invalid number", () => {
    expect(() => formatPhoneNumber("123")).toThrow();
  });
});

describe("VAT ID", () => {
  it("accepts a valid checksum", () => {
    expect(isValidVatId("0105564068709")).toBe(true);
    expect(isValidVatId("1101700207366")).toBe(true);
  });

  it("rejects invalid checksum or shape", () => {
    expect(isValidVatId("123")).toBe(false);
  });
});

describe("email", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("kimmylps.dev@gmail.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@missing-local.com")).toBe(false);
  });
});

describe("postal code", () => {
  it("validates 5-digit codes", () => {
    expect(isValidPostalCode("10240")).toBe(true);
    expect(isValidPostalCode("1024")).toBe(false);
  });
});
