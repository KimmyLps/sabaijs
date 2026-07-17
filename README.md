# sabaijs

An all-in-one Node.js utility toolkit — Thai-locale helpers (address parsing, geography, validators, date, currency, bank, quotation/receipt documents) plus general-purpose utilities (collections, batch file processing).

```bash
npm install sabaijs
```

Import everything from the root, or pull individual modules via subpath exports (`sabaijs/address`, `sabaijs/geography`, etc.) to keep bundles small.

```ts
// Named imports (recommended — tree-shakeable)
import { parseThaiAddress } from "sabaijs";

// Default import — everything namespaced under one object
import sabaijs from "sabaijs";
sabaijs.parseThaiAddress("19 ตำบลในเมือง อำเภอเมืองขอนแก่น ขอนแก่น 40000");
```

## Modules

### Address parser
```ts
import { formatThaiAddress, parseThaiAddress } from "sabaijs/address";

parseThaiAddress("99 หมู่บ้านสุขสันต์ อาคารเอ ชั้น 4 ห้อง 401 หมู่ 3 ตำบลบางแก้ว อำเภอบางพลี จังหวัดสมุทรปราการ");
// { houseNumber: "99", village: "สุขสันต์", building: "เอ", floor: "4", room: "401", moo: "3",
//   subDistrict: "บางแก้ว", district: "บางพลี", province: "สมุทรปราการ",
//   postalCode: "10540" (auto-filled from the sub-district dataset),
//   provinceInfo: {...}, subDistrictInfo: {...}, isComplete: true }

// Also recognizes แยก (intersection), เลขที่ house-number prefix, and a bare
// trailing province name when "จังหวัด"/"จ." is omitted:
parseThaiAddress("19 ตำบลในเมือง อำเภอเมืองขอนแก่น ขอนแก่น 40000");
// { houseNumber: "19", subDistrict: "ในเมือง", district: "เมืองขอนแก่น", province: "ขอนแก่น", postalCode: "40000", ... }

// Reverse: build a canonical address string from structured parts
formatThaiAddress({
  houseNumber: "123/45", moo: "6", soi: "ลาดพร้าว 101", road: "ลาดพร้าว",
  subDistrict: "คลองจั่น", district: "บางกะปิ", province: "กรุงเทพมหานคร", postalCode: "10240",
});
// "123/45 หมู่ 6 ซอยลาดพร้าว 101 ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240"
```

### Batch file processing
```ts
import { batchProcessDirectory } from "sabaijs/batch";

const results = await batchProcessDirectory("./uploads", async (filePath) => {
  return processFile(filePath);
}, { concurrency: 8, recursive: true });
```

### Geography (6-region standard, full district/sub-district data)
```ts
import {
  PROVINCES, getProvincesByRegion, findProvince, findProvinceByZipcode,
  DISTRICTS, findDistrict, getDistrictsByProvince,
  SUBDISTRICTS, findSubDistrict, getSubDistrictsByDistrict, findSubDistrictByZipcode,
} from "sabaijs/geography";

getProvincesByRegion("south");        // all southern provinces
findProvince("เชียงใหม่");             // Chiang Mai province record
findProvinceByZipcode("50200");       // Chiang Mai (exact sub-district match, falls back to province prefix)
getDistrictsByProvince("50");         // all 25 amphoe of Chiang Mai
findSubDistrict("บางแก้ว", "บางพลี"); // tambon record scoped to a district
findSubDistrictByZipcode("10540");    // every tambon sharing that zipcode
```

### Eloquent-style Collection
```ts
import { Collection } from "sabaijs/collection";

new Collection(people)
  .filter((p) => p.age > 18)
  .groupBy("province")
  .get("Bangkok") // always a Collection (empty if the key isn't present) — no ?./! needed
  .sortBy("age")
  .pluck("name");

new Collection(people).partition((p) => p.age >= 18); // [adults, minors]
new Collection(people).whereBetween("age", 18, 30);
new Collection(people).paginate(2, 10); // page 2, 10 per page
```

### Date management (Buddhist Era)
```ts
import { formatThaiDate, parseThaiDate, toBuddhistYear, calculateAge } from "sabaijs/date";

formatThaiDate(new Date(), { weekday: "full" }); // "วันอังคารที่ 14 กรกฎาคม 2569"
parseThaiDate("14/07/2569");                     // Date (2026-07-14)
```

### Validators
```ts
import { isValidCitizenId, isValidEmail, isValidMobilePhone, isValidPostalCode, isValidVatId, formatPhoneNumber } from "sabaijs/validators";

isValidCitizenId("1101700207366"); // true (mod-11 checksum)
isValidMobilePhone("081-234-5678"); // true
formatPhoneNumber("0812345678"); // "081-234-5678"
isValidEmail("kimmylps.dev@gmail.com"); // true
isValidVatId("0105564068709"); // true (same 13-digit checksum as isValidTaxId, named for VAT call sites)
```

### Currency (Thai/English baht text)
```ts
import { toBahtText, parseBahtText, toBahtTextEn, numberToEnglishWords } from "sabaijs/currency";

toBahtText(1234.5); // "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์"
toBahtText(100);    // "หนึ่งร้อยบาทถ้วน"
parseBahtText("หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์"); // 1234.5

toBahtTextEn(8500);          // "Eight Thousand Five Hundred Baht"
numberToEnglishWords(8500);  // "Eight Thousand Five Hundred"
```

### Bank
```ts
import { THAI_BANKS, findBank, formatBankAccountNumber, isValidBankAccountNumber, generatePromptPayPayload } from "sabaijs/bank";

findBank("004"); // { code: "004", nameTh: "ธนาคารกสิกรไทย", nameEn: "Kasikornbank", ... }
isValidBankAccountNumber("123-4-56789-0"); // true
formatBankAccountNumber("1234567890", "004"); // "123-4-56789-0"

// EMV QR Code payload for a PromptPay mobile number or citizen/tax ID.
// Pass amount for a fixed-amount QR; omit it for an any-amount QR.
// Feed the returned string into any QR code image library to render it.
generatePromptPayPayload("0812345678");      // static (any-amount) payload
generatePromptPayPayload("0812345678", 100); // dynamic payload, fixed at ฿100
```

### Invoice / document numbering
```ts
import { generateDocumentNumber, incrementDocumentNumber, parseDocumentNumber } from "sabaijs/invoice";

generateDocumentNumber({ prefix: "INV", sequence: 1 }); // "INV-2569-0001" (Buddhist Era year by default)
parseDocumentNumber("INV-2569-0001"); // { prefix: "INV", year: 2569, sequence: 1 }

// Compact YYYYMM + 5-digit running number, e.g. "INV-20260700001" / "QT-20260700001"
const opts = { buddhistEra: false, includeMonth: true, sequenceWidth: 5, sequenceSeparator: "" };
generateDocumentNumber({ prefix: "INV", sequence: 1, ...opts }); // "INV-20260700001"
parseDocumentNumber("QT-20260700001", opts); // { prefix: "QT", year: 2026, month: 7, sequence: 1 }

// Bump the sequence on the last-issued number without tracking a counter yourself
incrementDocumentNumber("INV-2569-0001"); // "INV-2569-0002"
```

### Quotation
Builds a bilingual (Thai/English) quotation document — computes per-line and
grand totals, then renders a self-contained HTML string you can print or feed
to a headless browser to produce a PDF (see [PDF export](#pdf-export) below).

```ts
import { generateQuotation, renderQuotationHtml } from "sabaijs/quotation";

const quotation = generateQuotation({
  documentNumber: "QO-20210800002",       // pair with sabaijs/invoice's generateDocumentNumber
  issueDate: new Date(2021, 7, 17),
  validUntil: new Date(2021, 7, 31),
  customer: { name: "Line:LookAtmee (K'Nat)", address: "Bangkok Thailand" },
  issuer: { name: "บริษัท บิลด์มีอัพ คอนซัลแทนท์ จำกัด", taxId: "0105564068709" },
  items: [
    { id: "P00007", description: "Bookkeeping", quantity: 1, unit: "times", unitPrice: 8500 },
    // discountPercent is optional per line, e.g. { ..., discountPercent: 10 }
  ],
  vatRate: 0.07,          // omit (or 0) for VAT-exempt, like the reference document
  currencyCode: "THB",    // shown next to the subtotal label (default: "THB")
  logoDataUri: "data:image/png;base64,...", // optional, shown top-right
  remarks: "...",
  preparedBy: "Kanokwan Soda",
});

quotation.items[0].amount;      // per-line amount after any discount
quotation.totals.grandTotal;    // subtotal + VAT

renderQuotationHtml(quotation); // self-contained HTML string
```

### Receipt
Shares its shapes with `sabaijs/quotation` (`ReceiptParty`, `ReceiptLineItem`,
etc. are aliases of the quotation types), plus `quotationToReceipt()` to carry
an accepted quotation's customer/items straight over into a receipt.

```ts
import { generateReceipt, quotationToReceipt, renderReceiptHtml } from "sabaijs/receipt";

const receiptInput = quotationToReceipt(quotation, {
  documentNumber: "RC-20210800001",
  issueDate: new Date(2021, 7, 20),
  paymentMethod: "โอนเงิน / Bank Transfer",
  receivedBy: "Kanokwan Soda",
});

const receipt = generateReceipt(receiptInput);
renderReceiptHtml(receipt); // self-contained HTML string with a "PAID" stamp
```

### PDF export
None of the document renderers pull in a PDF/HTML-to-PDF dependency, to keep
sabaijs zero-dep and tree-shakeable. Feed the rendered HTML string to a
headless browser in your own app instead, e.g. with
[Puppeteer](https://pptr.dev/):

```ts
import puppeteer from "puppeteer";
import { renderQuotationHtml } from "sabaijs/quotation";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(renderQuotationHtml(quotation), { waitUntil: "networkidle0" });
await page.pdf({ path: "quotation.pdf", format: "A4" });
await browser.close();
```

### Text
```ts
import { sortThai, toThaiNumerals, toArabicNumerals } from "sabaijs/text";

sortThai(["ไก่", "ขวด", "อ่าง"]); // Thai dictionary order via Intl.Collator("th")
toThaiNumerals(2569);             // "๒๕๖๙"
toArabicNumerals("๒๕๖๙");         // "2569"
```

## Development

```bash
npm install
npm test        # vitest
npm run build   # tsup -> dist/ (ESM + CJS + .d.ts)
```

## Notes / limitations

- `geography` ships all 77 provinces (6-region classification), 930 districts, and 7,452 sub-districts with exact zipcodes, sourced from [kongvut/thai-province-data](https://github.com/kongvut/thai-province-data) (MIT licensed).
- `address` parsing is keyword-anchored (ตำบล/อำเภอ/จังหวัด or Bangkok's แขวง/เขต) rather than ML-based; unusual formatting or omitted keywords may parse partially. When the sub-district is recognized, missing province/postal code are auto-filled from the geography dataset.
