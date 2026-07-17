export interface ThaiBank {
  code: string;
  nameTh: string;
  nameEn: string;
  /** 3-digit routing/promptpay prefix used on cheques and interbank transfer forms. */
  swift?: string;
}

export const THAI_BANKS: ThaiBank[] = [
  { code: "002", nameTh: "ธนาคารกรุงเทพ", nameEn: "Bangkok Bank", swift: "BKKBTHBK" },
  { code: "004", nameTh: "ธนาคารกสิกรไทย", nameEn: "Kasikornbank", swift: "KASITHBK" },
  { code: "006", nameTh: "ธนาคารกรุงไทย", nameEn: "Krungthai Bank", swift: "KRTHTHBK" },
  { code: "011", nameTh: "ธนาคารทหารไทยธนชาต", nameEn: "TMBThanachart Bank", swift: "TMBKTHBK" },
  { code: "014", nameTh: "ธนาคารไทยพาณิชย์", nameEn: "Siam Commercial Bank", swift: "SICOTHBK" },
  { code: "022", nameTh: "ธนาคารซีไอเอ็มบี ไทย", nameEn: "CIMB Thai Bank", swift: "UBOBTHBK" },
  { code: "024", nameTh: "ธนาคารยูโอบี", nameEn: "United Overseas Bank (Thai)", swift: "UOVBTHBK" },
  { code: "025", nameTh: "ธนาคารกรุงศรีอยุธยา", nameEn: "Bank of Ayudhya (Krungsri)", swift: "AYUDTHBK" },
  { code: "030", nameTh: "ธนาคารออมสิน", nameEn: "Government Savings Bank" },
  { code: "033", nameTh: "ธนาคารอาคารสงเคราะห์", nameEn: "Government Housing Bank" },
  { code: "034", nameTh: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร", nameEn: "Bank for Agriculture and Agricultural Cooperatives (BAAC)" },
  { code: "065", nameTh: "ธนาคารธนชาต", nameEn: "Thanachart Bank" },
  { code: "066", nameTh: "ธนาคารอิสลามแห่งประเทศไทย", nameEn: "Islamic Bank of Thailand" },
  { code: "069", nameTh: "ธนาคารเกียรตินาคินภัทร", nameEn: "Kiatnakin Phatra Bank" },
  { code: "070", nameTh: "ธนาคารไอซีบีซี (ไทย)", nameEn: "Industrial and Commercial Bank of China (Thai)" },
  { code: "071", nameTh: "ธนาคารไทยเครดิต", nameEn: "Thai Credit Bank" },
  { code: "073", nameTh: "ธนาคารแลนด์ แอนด์ เฮ้าส์", nameEn: "Land and Houses Bank" },
  { code: "079", nameTh: "ธนาคารเมกะ สากลพาณิชย์", nameEn: "Mega International Commercial Bank" },
  { code: "080", nameTh: "ธนาคารแห่งอเมริกา", nameEn: "Bank of America" },
  { code: "098", nameTh: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย", nameEn: "SME Development Bank of Thailand" },
];

/** Look up a Thai bank by its 3-digit code, e.g. "004". */
export function findBank(code: string): ThaiBank | undefined {
  return THAI_BANKS.find((bank) => bank.code === code);
}

/** Validate a Thai bank account number: digits only, 10-15 characters long. */
export function isValidBankAccountNumber(accountNumber: string): boolean {
  const digits = accountNumber.replace(/[\s-]/g, "");
  return /^\d{10,15}$/.test(digits);
}

/**
 * Digit grouping used on passbooks/ATM cards, keyed by bank code. Most Thai
 * banks share the common 10-digit "xxx-x-xxxxx-x" grouping; only add an
 * entry here when a bank's own format is known to differ.
 */
export const BANK_ACCOUNT_NUMBER_GROUPS: Record<string, number[]> = {
  "002": [3, 1, 5, 1], // Bangkok Bank
  "004": [3, 1, 5, 1], // Kasikornbank
  "006": [3, 1, 5, 1], // Krungthai Bank
  "014": [3, 1, 5, 1], // Siam Commercial Bank
  "025": [3, 1, 5, 1], // Bank of Ayudhya (Krungsri)
};

const DEFAULT_ACCOUNT_NUMBER_GROUPS = [3, 1, 5, 1];

/**
 * Format a Thai bank account number with the dash grouping used on
 * passbooks/ATM cards. Falls back to the common 10-digit grouping (or the
 * plain digit string, if the length doesn't match any known grouping) when
 * `bankCode` is omitted or has no registered format.
 */
export function formatBankAccountNumber(accountNumber: string, bankCode?: string): string {
  const digits = accountNumber.replace(/[\s-]/g, "");
  const groups = (bankCode ? BANK_ACCOUNT_NUMBER_GROUPS[bankCode] : undefined) ?? DEFAULT_ACCOUNT_NUMBER_GROUPS;

  if (digits.length !== groups.reduce((sum, size) => sum + size, 0)) {
    return digits;
  }

  const parts: string[] = [];
  let offset = 0;
  for (const size of groups) {
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }
  return parts.join("-");
}
