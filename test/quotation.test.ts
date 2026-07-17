import { describe, expect, it } from "vitest";
import { calculateQuotationTotals, generateQuotation, renderQuotationHtml } from "../src/quotation/index.js";

const items = [{ id: "P00007", description: "Professional service expenses - bookkeeping", quantity: 1, unit: "times", unitPrice: 8500 }];

describe("calculateQuotationTotals", () => {
  it("computes subtotal, VAT, and grand total", () => {
    expect(calculateQuotationTotals(items)).toEqual({ subtotal: 8500, vat: 0, grandTotal: 8500 });
  });

  it("applies a VAT rate", () => {
    expect(calculateQuotationTotals(items, 0.07)).toEqual({ subtotal: 8500, vat: 595, grandTotal: 9095 });
  });
});

describe("calculateQuotationTotals with discounts", () => {
  it("applies a per-line discount before summing", () => {
    const discounted = [{ id: "P1", description: "x", quantity: 2, unit: "pcs", unitPrice: 100, discountPercent: 10 }];
    expect(calculateQuotationTotals(discounted)).toEqual({ subtotal: 180, vat: 0, grandTotal: 180 });
  });
});

describe("generateQuotation", () => {
  it("enriches items with per-line amounts and totals", () => {
    const quotation = generateQuotation({
      documentNumber: "QO-20210800002",
      issueDate: new Date(2021, 7, 17),
      customer: { name: "Line:LookAtmee (K'Nat)" },
      issuer: { name: "บริษัท บิลด์มีอัพ คอนซัลแทนท์ จำกัด" },
      items,
    });
    expect(quotation.items[0].amount).toBe(8500);
    expect(quotation.totals.grandTotal).toBe(8500);
  });
});

describe("renderQuotationHtml", () => {
  const quotation = generateQuotation({
    documentNumber: "QO-20210800002",
    issueDate: new Date(2021, 7, 17),
    validUntil: new Date(2021, 7, 31),
    customer: { name: "Line:LookAtmee (K'Nat)", address: "Bangkok Thailand" },
    issuer: { name: "บริษัท บิลด์มีอัพ คอนซัลแทนท์ จำกัด", taxId: "0105564068709" },
    items,
    preparedBy: "Kanokwan Soda",
  });
  const html = renderQuotationHtml(quotation);

  it("renders a self-contained HTML document", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("QO-20210800002");
    expect(html).toContain("17/08/2021");
    expect(html).toContain("31/08/2021");
  });

  it("renders line items and totals", () => {
    expect(html).toContain("P00007");
    expect(html).toContain("8,500.00");
    expect(html).toContain("Eight Thousand Five Hundred Baht");
  });

  it("escapes party names to avoid HTML injection", () => {
    const malicious = generateQuotation({
      documentNumber: "QO-1",
      issueDate: new Date(2021, 0, 1),
      customer: { name: "<script>alert(1)</script>" },
      issuer: { name: "Issuer" },
      items,
    });
    expect(renderQuotationHtml(malicious)).not.toContain("<script>alert(1)</script>");
  });

  it("shows a discount column only when a line item has a discount", () => {
    expect(html).not.toContain("Discount");

    const discounted = generateQuotation({
      documentNumber: "QO-1",
      issueDate: new Date(2021, 0, 1),
      customer: { name: "Customer" },
      issuer: { name: "Issuer" },
      items: [{ ...items[0], discountPercent: 10 }],
    });
    expect(renderQuotationHtml(discounted)).toContain("Discount");
  });

  it("renders a logo image when logoDataUri is provided", () => {
    const withLogo = generateQuotation({
      documentNumber: "QO-1",
      issueDate: new Date(2021, 0, 1),
      customer: { name: "Customer" },
      issuer: { name: "Issuer" },
      items,
      logoDataUri: "data:image/png;base64,abc123",
    });
    expect(renderQuotationHtml(withLogo)).toContain('src="data:image/png;base64,abc123"');
  });
});
