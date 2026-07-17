import { toBahtTextEn } from "../currency/index.js";

export interface QuotationParty {
  name: string;
  address?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  /** Contact person / attention line, e.g. "Line:LookAtmee (K'Nat)". */
  attention?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  /** Line discount as a percentage, e.g. 10 for 10% off (default: 0). */
  discountPercent?: number;
}

export interface QuotationPaymentInfo {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface QuotationInput {
  /** Document number, e.g. from {@link import("../invoice/index.js").generateDocumentNumber}. */
  documentNumber: string;
  issueDate: Date;
  validUntil?: Date;
  ref?: string;
  customer: QuotationParty;
  issuer: QuotationParty;
  items: QuotationLineItem[];
  /** VAT rate as a fraction, e.g. 0.07 for 7% (default: 0, i.e. VAT-exempt). */
  vatRate?: number;
  remarks?: string;
  payment?: QuotationPaymentInfo;
  preparedBy?: string;
  /** Whether this is the original copy or a duplicate (default: true). */
  isOriginal?: boolean;
  /** ISO 4217 currency code shown next to totals, e.g. "THB" (default: "THB"). */
  currencyCode?: string;
  /** Company logo as a data URI (e.g. "data:image/png;base64,..."), shown top-right. */
  logoDataUri?: string;
}

export interface QuotationLineItemTotal extends QuotationLineItem {
  amount: number;
}

export interface QuotationTotals {
  subtotal: number;
  vat: number;
  grandTotal: number;
}

export interface Quotation extends Omit<QuotationInput, "items"> {
  items: QuotationLineItemTotal[];
  totals: QuotationTotals;
}

/** Line total after applying the item's discount, e.g. quantity 2 @ 100 with 10% off -> 180. */
export function calculateLineAmount(item: QuotationLineItem): number {
  const gross = item.quantity * item.unitPrice;
  return gross * (1 - (item.discountPercent ?? 0) / 100);
}

/** Compute subtotal, VAT, and grand total for a set of line items (after per-line discounts). */
export function calculateQuotationTotals(items: QuotationLineItem[], vatRate = 0): QuotationTotals {
  const subtotal = items.reduce((sum, item) => sum + calculateLineAmount(item), 0);
  const vat = subtotal * vatRate;
  return { subtotal, vat, grandTotal: subtotal + vat };
}

/** Enrich raw quotation input with computed per-line amounts and totals. */
export function generateQuotation(input: QuotationInput): Quotation {
  const vatRate = input.vatRate ?? 0;
  const items = input.items.map((item) => ({ ...item, amount: calculateLineAmount(item) }));
  const totals = calculateQuotationTotals(input.items, vatRate);
  return { ...input, items, totals };
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

function partyBlock(party: QuotationParty): { name: string; address: string; taxId: string; contact: string } {
  return {
    name: escapeHtml(party.name || "-"),
    address: escapeHtml(party.address || "-"),
    taxId: escapeHtml(party.taxId || "-"),
    contact: escapeHtml(party.attention || "-"),
  };
}

/**
 * Render a bilingual (Thai/English) quotation document as a self-contained
 * HTML string, suitable for printing or converting to PDF in a browser.
 */
export function renderQuotationHtml(quotation: Quotation): string {
  const { documentNumber, issueDate, validUntil, ref, customer, issuer, items, totals, remarks, payment, preparedBy, logoDataUri } = quotation;
  const isOriginal = quotation.isOriginal ?? true;
  const currencyCode = quotation.currencyCode ?? "THB";
  const hasDiscount = items.some((item) => (item.discountPercent ?? 0) > 0);

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
        ${hasDiscount ? `<td class="num">${(item.discountPercent ?? 0).toFixed(2)}%</td>` : ""}
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
<title>Quotation ${escapeHtml(documentNumber)}</title>
<style>
  body { font-family: "Sarabun", "Segoe UI", sans-serif; color: #111; padding: 32px; }
  h1 { font-size: 28px; margin: 0; }
  .subtitle { color: #555; font-size: 14px; margin-top: 4px; }
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
  .signatures { display: flex; justify-content: space-between; margin-top: 64px; font-size: 13px; }
  .sig-line { border-top: 1px solid #333; width: 220px; margin-top: 48px; padding-top: 4px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ใบเสนอราคา / Quotation</h1>
      <div class="subtitle">${isOriginal ? "( ต้นฉบับ / original )" : "( สำเนา / copy )"}</div>
    </div>
    ${logo}
  </div>

  <div class="meta-grid">
    <div>
      <div><span class="label">ลูกค้า / Customer:</span> ${customerBlock.name}</div>
      <div><span class="label">ที่อยู่ / Address:</span> ${customerBlock.address}</div>
      <div><span class="label">เลขผู้เสียภาษี / Tax ID:</span> ${customerBlock.taxId}</div>
      <div><span class="label">ผู้ติดต่อ / Attention:</span> ${customerBlock.contact}</div>
    </div>
    <div>
      <div><span class="label">เลขที่ / No.:</span> ${escapeHtml(documentNumber)}</div>
      <div><span class="label">วันที่ / Issue:</span> ${formatDate(issueDate)}</div>
      <div><span class="label">ใช้ได้ถึง / Valid:</span> ${validUntil ? formatDate(validUntil) : "-"}</div>
      <div><span class="label">อ้างอิง / Ref:</span> ${escapeHtml(ref || "-")}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div><span class="label">ผู้ออก / issuer:</span> ${issuerBlock.name}</div>
      <div><span class="label">ที่อยู่:</span> ${issuerBlock.address}</div>
    </div>
    <div>
      <div><span class="label">เลขผู้เสียภาษี / Tax ID:</span> ${issuerBlock.taxId}</div>
      <div><span class="label">ติดต่อ:</span> ${issuerBlock.contact}</div>
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
        ${hasDiscount ? "<th>ส่วนลด<br>Discount</th>" : ""}
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
      <tr class="grand-total"><td>จำนวนเงินรวมทั้งสิ้น / Grand Total</td><td class="num">${formatMoney(totals.grandTotal)}</td></tr>
    </table>
  </div>
  <div class="words">Total Amount: ${escapeHtml(amountInWords)}</div>

  <div class="meta-grid" style="margin-top: 24px;">
    <div>
      <div><span class="label">การชำระเงิน / Payment</span></div>
      <div><span class="label">ธนาคาร:</span> ${escapeHtml(payment?.bankName || "-")}</div>
      <div><span class="label">ชื่อบัญชี:</span> ${escapeHtml(payment?.accountName || "-")}</div>
      <div><span class="label">เลขที่บัญชี:</span> ${escapeHtml(payment?.accountNumber || "-")}</div>
    </div>
  </div>

  <div class="signatures">
    <div>อนุมัติโดย / Approved by<div class="sig-line">วันที่ / Date</div></div>
    <div>ยอมรับใบเสนอราคา / Accepted by<div class="sig-line">วันที่ / Date</div></div>
  </div>

  <div style="margin-top: 32px; font-size: 12px; color: #555;">จัดเตรียมโดย / Prepared by: ${escapeHtml(preparedBy || "-")}</div>
</body>
</html>`;
}
