import { describe, expect, it } from "vitest";
import { generateDocumentNumber, incrementDocumentNumber, parseDocumentNumber } from "../src/invoice/index.js";

describe("generateDocumentNumber", () => {
  it("builds a document number with Buddhist Era year by default", () => {
    const number = generateDocumentNumber({ prefix: "INV", date: new Date(2026, 6, 14), sequence: 1 });
    expect(number).toBe("INV-2569-0001");
  });

  it("supports Gregorian year and custom sequence width", () => {
    const number = generateDocumentNumber({
      prefix: "QT",
      date: new Date(2026, 6, 14),
      buddhistEra: false,
      sequence: 42,
      sequenceWidth: 6,
    });
    expect(number).toBe("QT-2026-000042");
  });

  it("rejects negative sequences", () => {
    expect(() => generateDocumentNumber({ sequence: -1 })).toThrow();
  });

  it("builds a compact YYYYMM + 5-digit sequence number", () => {
    const number = generateDocumentNumber({
      prefix: "INV",
      date: new Date(2026, 6, 14),
      buddhistEra: false,
      includeMonth: true,
      sequence: 1,
      sequenceWidth: 5,
      sequenceSeparator: "",
    });
    expect(number).toBe("INV-20260700001");
  });
});

describe("parseDocumentNumber", () => {
  it("parses a generated document number back into parts", () => {
    expect(parseDocumentNumber("INV-2569-0001")).toEqual({ prefix: "INV", year: 2569, sequence: 1 });
  });

  it("parses a compact YYYYMM + sequence number given matching options", () => {
    const options = { includeMonth: true, sequenceWidth: 5, sequenceSeparator: "" };
    expect(parseDocumentNumber("INV-20260700001", options)).toEqual({
      prefix: "INV",
      year: 2026,
      month: 7,
      sequence: 1,
    });
    expect(parseDocumentNumber("QT-20260700001", options)).toEqual({
      prefix: "QT",
      year: 2026,
      month: 7,
      sequence: 1,
    });
  });

  it("returns null when the shape doesn't match the given options", () => {
    expect(parseDocumentNumber("INV-20260700001")).toBeNull();
  });

  it("returns null for unparseable input", () => {
    expect(parseDocumentNumber("not-a-number")).toBeNull();
  });
});

describe("incrementDocumentNumber", () => {
  it("bumps the sequence, preserving the parsed year", () => {
    expect(incrementDocumentNumber("INV-2569-0001")).toBe("INV-2569-0002");
  });

  it("bumps the sequence for a compact YYYYMM number", () => {
    const options = { includeMonth: true, sequenceWidth: 5, sequenceSeparator: "" };
    expect(incrementDocumentNumber("INV-20260700001", options)).toBe("INV-20260700002");
  });

  it("throws when the previous number can't be parsed", () => {
    expect(() => incrementDocumentNumber("not-a-number")).toThrow();
  });
});
