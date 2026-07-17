import { toBuddhistYear } from "../date/index.js";

export interface DocumentNumberOptions {
  /** Document type prefix, e.g. "INV", "QT", "RCP" (default: "INV"). */
  prefix?: string;
  /** Date to derive the year (and month) from (default: now). */
  date?: Date;
  /** Use Buddhist Era year instead of Gregorian (default: true). */
  buddhistEra?: boolean;
  /** Embed a 2-digit month after the year, e.g. "INV-202607-0001" (default: false). */
  includeMonth?: boolean;
  /** Running number to embed. */
  sequence: number;
  /** Zero-padded width of the sequence segment (default: 4). */
  sequenceWidth?: number;
  /** Separator between the year/month block and the sequence (default: "-"; use "" for a compact number like "INV-20260700001"). */
  sequenceSeparator?: string;
}

/**
 * Build a running document number from a prefix, date, and sequence, e.g.
 * "INV-2569-0001" (default) or "INV-20260700001" with `includeMonth: true,
 * buddhistEra: false, sequenceWidth: 5, sequenceSeparator: ""`.
 */
export function generateDocumentNumber(options: DocumentNumberOptions): string {
  const {
    prefix = "INV",
    date = new Date(),
    buddhistEra = true,
    includeMonth = false,
    sequence,
    sequenceWidth = 4,
    sequenceSeparator = "-",
  } = options;
  if (sequence < 0) throw new Error(`sequence must be non-negative, got ${sequence}`);

  const year = buddhistEra ? toBuddhistYear(date.getFullYear()) : date.getFullYear();
  const month = includeMonth ? String(date.getMonth() + 1).padStart(2, "0") : "";
  const paddedSequence = String(sequence).padStart(sequenceWidth, "0");
  return `${prefix}-${year}${month}${sequenceSeparator}${paddedSequence}`;
}

export interface ParsedDocumentNumber {
  prefix: string;
  year: number;
  month?: number;
  sequence: number;
}

export interface ParseDocumentNumberOptions {
  /** Must match the `includeMonth` used to generate the number (default: false). */
  includeMonth?: boolean;
  /** Must match the `sequenceWidth` used to generate the number (default: 4). */
  sequenceWidth?: number;
  /** Must match the `sequenceSeparator` used to generate the number (default: "-"). */
  sequenceSeparator?: string;
}

/** Parse a document number produced by {@link generateDocumentNumber} back into its parts. */
export function parseDocumentNumber(
  documentNumber: string,
  options: ParseDocumentNumberOptions = {},
): ParsedDocumentNumber | null {
  const { includeMonth = false, sequenceWidth = 4, sequenceSeparator = "-" } = options;

  const yearAndMonthLength = 4 + (includeMonth ? 2 : 0);
  const escapedSeparator = sequenceSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^([A-Za-z]+)-(\\d{${yearAndMonthLength}})${escapedSeparator}(\\d{${sequenceWidth}})$`);
  const match = documentNumber.trim().match(pattern);
  if (!match) return null;

  const [, prefix, yearAndMonth, sequenceStr] = match;
  const year = Number(yearAndMonth.slice(0, 4));
  const month = includeMonth ? Number(yearAndMonth.slice(4, 6)) : undefined;
  const sequence = Number(sequenceStr);

  return includeMonth ? { prefix, year, month, sequence } : { prefix, year, sequence };
}

/**
 * Parse a document number and produce the next one in the same shape, with
 * its sequence incremented by 1. Reuses the parsed prefix/year/month rather
 * than the current date, so it's safe to call repeatedly within the same period.
 */
export function incrementDocumentNumber(
  documentNumber: string,
  options: ParseDocumentNumberOptions = {},
): string {
  const { includeMonth = false, sequenceWidth = 4, sequenceSeparator = "-" } = options;
  const parsed = parseDocumentNumber(documentNumber, options);
  if (!parsed) throw new Error(`Cannot parse document number: "${documentNumber}"`);

  const month = includeMonth ? String(parsed.month).padStart(2, "0") : "";
  const paddedSequence = String(parsed.sequence + 1).padStart(sequenceWidth, "0");
  return `${parsed.prefix}-${parsed.year}${month}${sequenceSeparator}${paddedSequence}`;
}
