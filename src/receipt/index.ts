import { toBahtTextEn } from "../currency/index.js";
import {
  calculateQuotationTotals,
  type Quotation,
  type QuotationLineItem,
  type QuotationLineItemTotal,
  type QuotationParty,
  type QuotationPaymentInfo,
  type QuotationTotals,
} from "../quotation/index.js";

export type ReceiptParty = QuotationParty;
export type ReceiptLineItem = QuotationLineItem;
export type ReceiptLineItemTotal = QuotationLineItemTotal;
export type ReceiptTotals = QuotationTotals;
export type ReceiptPaymentInfo = QuotationPaymentInfo;

export interface ReceiptInput {
  documentNumber: string;
  issueDate: Date;
  ref?: string;
  /** The quotation or invoice number this receipt settles, if any. */
  referenceDocumentNumber?: string;
  customer: ReceiptParty;
  issuer: ReceiptParty;
  items: ReceiptLineItem[];
  /** VAT rate as a fraction, e.g. 0.07 for 7% (default: 0, i.e. VAT-exempt). */
  vatRate?: number;
  remarks?: string;
  payment?: ReceiptPaymentInfo;
  /** How the payment was made, e.g. "โอนเงิน / Bank Transfer", "เงินสด / Cash". */
  paymentMethod?: string;
  receivedBy?: string;
  currencyCode?: string;
  logoDataUri?: string;
}

export interface Receipt extends Omit<ReceiptInput, "items"> {
  items: ReceiptLineItemTotal[];
  totals: ReceiptTotals;
}

/** Enrich raw receipt input with computed per-line amounts and totals. */
export function generateReceipt(input: ReceiptInput): Receipt {
  const vatRate = input.vatRate ?? 0;
  const items = input.items.map((item) => ({
    ...item,
    amount: item.quantity * item.unitPrice * (1 - (item.discountPercent ?? 0) / 100),
  }));
  const totals = calculateQuotationTotals(input.items, vatRate);
  return { ...input, items, totals };
}

/**
 * Build receipt input from an accepted {@link Quotation}, carrying over the
 * customer/issuer/items/totals and recording the quotation number as the reference.
 */
export function quotationToReceipt(
  quotation: Quotation,
  options: { documentNumber: string; issueDate: Date; paymentMethod?: string; receivedBy?: string },
): ReceiptInput {
  return {
    documentNumber: options.documentNumber,
    issueDate: options.issueDate,
    referenceDocumentNumber: quotation.documentNumber,
    customer: quotation.customer,
    issuer: quotation.issuer,
    items: quotation.items,
    vatRate: quotation.vatRate,
    remarks: quotation.remarks,
    payment: quotation.payment,
    paymentMethod: options.paymentMethod,
    receivedBy: options.receivedBy,
    currencyCode: quotation.currencyCode,
    logoDataUri: quotation.logoDataUri,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function partyBlock(party: ReceiptParty): { name: string; address: string; taxId: string } {
  return {
    name: escapeHtml(party.name || "-"),
    address: escapeHtml(party.address || "-"),
    taxId: escapeHtml(party.taxId || "-"),
  };
}

/**
 * Render a bilingual (Thai/English) receipt document as a self-contained
 * HTML string, suitable for printing or converting to PDF in a browser.
 */
export function renderReceiptHtml(receipt: Receipt): string {
  const { documentNumber, issueDate, referenceDocumentNumber, customer, issuer, items, totals, remarks, paymentMethod, receivedBy, logoDataUri } = receipt;
  const currencyCode = receipt.currencyCode ?? "THB";

  const customerBlock = partyBlock(customer);
  const issuerBlock = partyBlock(issuer);

  const rows = items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity.toFixed(2)}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="num">${formatMoney(item.unitPrice)}</td>
        <td class="num">${formatMoney(item.amount)}</td>
      </tr>`,
    )
    .join("");

  const amountInWords = toBahtTextEn(totals.grandTotal);
  const logo = logoDataUri ? `<img src="${escapeHtml(logoDataUri)}" alt="logo" class="logo">` : "";

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Receipt ${escapeHtml(documentNumber)}</title>
<style>
  body { font-family: "Sarabun", "Segoe UI", sans-serif; color: #111; padding: 32px; }
  h1 { font-size: 28px; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { max-width: 120px; max-height: 120px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #333; padding: 8px; font-size: 13px; text-align: left; vertical-align: top; }
  th { background: #f2f2f2; }
  .num { text-align: right; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 13px; margin-top: 16px; }
  .label { color: #555; }
  .totals { display: flex; justify-content: flex-end; margin-top: 12px; }
  .totals table { width: 360px; }
  .grand-total { font-weight: bold; font-size: 15px; }
  .words { text-align: right; font-weight: bold; margin-top: 8px; }
  .paid-stamp { color: #1a7a1a; font-weight: bold; border: 2px solid #1a7a1a; display: inline-block; padding: 4px 12px; margin-top: 8px; }
  .signatures { display: flex; justify-content: flex-end; margin-top: 64px; font-size: 13px; }
  .sig-line { border-top: 1px solid #333; width: 220px; margin-top: 48px; padding-top: 4px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ใบเสร็จรับเงิน / Receipt</h1>
      <div class="paid-stamp">ได้รับเงินแล้ว / PAID</div>
    </div>
    ${logo}
  </div>

  <div class="meta-grid">
    <div>
      <div><span class="label">ลูกค้า / Customer:</span> ${customerBlock.name}</div>
      <div><span class="label">ที่อยู่ / Address:</span> ${customerBlock.address}</div>
      <div><span class="label">เลขผู้เสียภาษี / Tax ID:</span> ${customerBlock.taxId}</div>
    </div>
    <div>
      <div><span class="label">เลขที่ / No.:</span> ${escapeHtml(documentNumber)}</div>
      <div><span class="label">วันที่ / Date:</span> ${formatDate(issueDate)}</div>
      <div><span class="label">อ้างอิงใบเสนอราคา / Ref Quotation:</span> ${escapeHtml(referenceDocumentNumber || "-")}</div>
      <div><span class="label">วิธีชำระเงิน / Payment Method:</span> ${escapeHtml(paymentMethod || "-")}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div><span class="label">ผู้ออก / issuer:</span> ${issuerBlock.name}</div>
      <div><span class="label">ที่อยู่:</span> ${issuerBlock.address}</div>
    </div>
    <div>
      <div><span class="label">เลขผู้เสียภาษี / Tax ID:</span> ${issuerBlock.taxId}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>รหัส<br>ID no.</th>
        <th>คำอธิบาย<br>Description</th>
        <th>จำนวน<br>Quantity</th>
        <th>หน่วย<br>Unit</th>
        <th>ราคาต่อหน่วย<br>Unit Price</th>
        <th>มูลค่าก่อนภาษี<br>Pre-Tax Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div><span class="label">หมายเหตุ / Remarks:</span> ${escapeHtml(remarks || "-")}</div>

  <div class="totals">
    <table>
      <tr><td>ราคาก่อนภาษี / Subtotal (${escapeHtml(currencyCode)})</td><td class="num">${formatMoney(totals.subtotal)}</td></tr>
      <tr><td>ภาษีมูลค่าเพิ่ม / VAT</td><td class="num">${formatMoney(totals.vat)}</td></tr>
      <tr class="grand-total"><td>จำนวนเงินรับทั้งสิ้น / Amount Received</td><td class="num">${formatMoney(totals.grandTotal)}</td></tr>
    </table>
  </div>
  <div class="words">Total Amount: ${escapeHtml(amountInWords)}</div>

  <div class="signatures">
    <div>ผู้รับเงิน / Received by: ${escapeHtml(receivedBy || "-")}<div class="sig-line">วันที่ / Date</div></div>
  </div>
</body>
</html>`;
}
