/** Validate a 13-digit Thai citizen ID using the official mod-11 checksum. */
export function isValidCitizenId(id: string): boolean {
  const digits = id.replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(digits[i]) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === Number(digits[12]);
}

/** Validate a Thai mobile number: 10 digits starting with 06, 08, or 09. */
export function isValidMobilePhone(phone: string): boolean {
  const digits = phone.replace(/[\s-]/g, "");
  return /^0[689]\d{8}$/.test(digits);
}

/** Validate a Thai landline number: 9 digits starting with 0, area code 2-7. */
export function isValidLandlinePhone(phone: string): boolean {
  const digits = phone.replace(/[\s-]/g, "");
  return /^0[2-7]\d{7}$/.test(digits);
}

/** Validate either a mobile or landline Thai phone number. */
export function isValidThaiPhone(phone: string): boolean {
  return isValidMobilePhone(phone) || isValidLandlinePhone(phone);
}

/** Validate an email address (pragmatic RFC 5322-ish check, not a full grammar). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Validate a Thai postal code: 5 digits. */
export function isValidPostalCode(zipcode: string): boolean {
  return /^\d{5}$/.test(zipcode.trim());
}

/** Validate a 13-digit Thai taxpayer identification number (same checksum as citizen ID). */
export function isValidTaxId(taxId: string): boolean {
  return isValidCitizenId(taxId);
}

/**
 * Validate a Thai VAT registration number. In Thailand this is the same
 * 13-digit juristic/taxpayer ID (see {@link isValidTaxId}) shown on tax
 * invoices — provided as a distinct name so VAT-specific call sites read clearly.
 */
export function isValidVatId(vatId: string): boolean {
  return isValidTaxId(vatId);
}

/** Validate a Thai vehicle license plate, e.g. "กข 1234" or "1กข234". */
export function isValidLicensePlate(plate: string): boolean {
  const normalized = plate.trim().replace(/\s+/g, " ");
  return /^[ก-ฮ]{1,3}\s?\d{1,4}$/.test(normalized) || /^\d{1,2}[ก-ฮ]{1,2}\d{1,4}$/.test(normalized);
}

/** Format a Thai mobile (081-234-5678) or landline (02-123-4567) number with dashes. */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/[\s-]/g, "");
  if (isValidMobilePhone(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (isValidLandlinePhone(digits)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  throw new Error(`Invalid Thai phone number: "${phone}"`);
}

/** Format a raw 13-digit citizen ID string as X-XXXX-XXXXX-XX-X. */
export function formatCitizenId(id: string): string {
  const digits = id.replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(digits)) {
    throw new Error(`Invalid citizen ID: expected 13 digits, got "${id}"`);
  }
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits[12]}`;
}
