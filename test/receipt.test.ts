import { describe, expect, it } from "vitest";
import { generateQuotation } from "../src/quotation/index.js";
import { generateReceipt, quotationToReceipt, renderReceiptHtml } from "../src/receipt/index.js";

const items = [{ id: "P00007", description: "Bookkeeping", quantity: 1, unit: "times", unitPrice: 8500 }];

describe("generateReceipt", () => {
  it("computes per-line amounts and totals", () => {
    const receipt = generateReceipt({
      documentNumber: "RC-1",
      issueDate: new Date(2021, 7, 20),
      customer: { name: "Customer" },
      issuer: { name: "Issuer" },
      items,
    });
    expect(receipt.items[0].amount).toBe(8500);
    expect(receipt.totals.grandTotal).toBe(8500);
  });
});

describe("quotationToReceipt", () => {
  it("carries over customer/issuer/items and records the quotation as reference", () => {
    const quotation = generateQuotation({
      documentNumber: "QO-20210800002",
      issueDate: new Date(2021, 7, 17),
      customer: { name: "Line:LookAtmee (K'Nat)" },
      issuer: { name: "Issuer Co." },
      items,
    });

    const receiptInput = quotationToReceipt(quotation, {
      documentNumber: "RC-20210800001",
      issueDate: new Date(2021, 7, 20),
      paymentMethod: "โอนเงิน / Bank Transfer",
    });

    expect(receiptInput.referenceDocumentNumber).toBe("QO-20210800002");
    expect(receiptInput.customer.name).toBe("Line:LookAtmee (K'Nat)");
    expect(receiptInput.items).toEqual(quotation.items);
  });
});

describe("renderReceiptHtml", () => {
  it("renders a self-contained HTML document with a PAID stamp", () => {
    const receipt = generateReceipt({
      documentNumber: "RC-20210800001",
      issueDate: new Date(2021, 7, 20),
      referenceDocumentNumber: "QO-20210800002",
      customer: { name: "Customer" },
      issuer: { name: "Issuer" },
      items,
      receivedBy: "Kanokwan Soda",
    });

    const html = renderReceiptHtml(receipt);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("PAID");
    expect(html).toContain("RC-20210800001");
    expect(html).toContain("QO-20210800002");
    expect(html).toContain("8,500.00");
  });
});
