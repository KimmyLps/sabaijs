export type ThaiRegion =
  | "north"
  | "northeast"
  | "central"
  | "east"
  | "west"
  | "south";

export interface Province {
  code: string;
  nameTh: string;
  nameEn: string;
  region: ThaiRegion;
  zipcodePrefixes: string[];
}

/**
 * 77 provinces classified per the 6-region standard used by the
 * Ministry of Interior / NSO (ภาคเหนือ, ภาคตะวันออกเฉียงเหนือ, ภาคกลาง,
 * ภาคตะวันออก, ภาคตะวันตก, ภาคใต้).
 */
export const PROVINCES: Province[] = [
  { code: "10", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok", region: "central", zipcodePrefixes: ["10"] },
  { code: "11", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan", region: "central", zipcodePrefixes: ["10"] },
  { code: "12", nameTh: "นนทบุรี", nameEn: "Nonthaburi", region: "central", zipcodePrefixes: ["11"] },
  { code: "13", nameTh: "ปทุมธานี", nameEn: "Pathum Thani", region: "central", zipcodePrefixes: ["12"] },
  { code: "14", nameTh: "พระนครศรีอยุธยา", nameEn: "Phra Nakhon Si Ayutthaya", region: "central", zipcodePrefixes: ["13"] },
  { code: "15", nameTh: "อ่างทอง", nameEn: "Ang Thong", region: "central", zipcodePrefixes: ["14"] },
  { code: "16", nameTh: "ลพบุรี", nameEn: "Lopburi", region: "central", zipcodePrefixes: ["15"] },
  { code: "17", nameTh: "สิงห์บุรี", nameEn: "Sing Buri", region: "central", zipcodePrefixes: ["16"] },
  { code: "18", nameTh: "ชัยนาท", nameEn: "Chai Nat", region: "central", zipcodePrefixes: ["17"] },
  { code: "19", nameTh: "สระบุรี", nameEn: "Saraburi", region: "central", zipcodePrefixes: ["18"] },
  { code: "20", nameTh: "ชลบุรี", nameEn: "Chon Buri", region: "east", zipcodePrefixes: ["20"] },
  { code: "21", nameTh: "ระยอง", nameEn: "Rayong", region: "east", zipcodePrefixes: ["21"] },
  { code: "22", nameTh: "จันทบุรี", nameEn: "Chanthaburi", region: "east", zipcodePrefixes: ["22"] },
  { code: "23", nameTh: "ตราด", nameEn: "Trat", region: "east", zipcodePrefixes: ["23"] },
  { code: "24", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao", region: "east", zipcodePrefixes: ["24"] },
  { code: "25", nameTh: "ปราจีนบุรี", nameEn: "Prachin Buri", region: "east", zipcodePrefixes: ["25"] },
  { code: "26", nameTh: "นครนายก", nameEn: "Nakhon Nayok", region: "central", zipcodePrefixes: ["26"] },
  { code: "27", nameTh: "สระแก้ว", nameEn: "Sa Kaeo", region: "east", zipcodePrefixes: ["27"] },
  { code: "30", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima", region: "northeast", zipcodePrefixes: ["30"] },
  { code: "31", nameTh: "บุรีรัมย์", nameEn: "Buri Ram", region: "northeast", zipcodePrefixes: ["31"] },
  { code: "32", nameTh: "สุรินทร์", nameEn: "Surin", region: "northeast", zipcodePrefixes: ["32"] },
  { code: "33", nameTh: "ศรีสะเกษ", nameEn: "Si Sa Ket", region: "northeast", zipcodePrefixes: ["33"] },
  { code: "34", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani", region: "northeast", zipcodePrefixes: ["34"] },
  { code: "35", nameTh: "ยโสธร", nameEn: "Yasothon", region: "northeast", zipcodePrefixes: ["35"] },
  { code: "36", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum", region: "northeast", zipcodePrefixes: ["36"] },
  { code: "37", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen", region: "northeast", zipcodePrefixes: ["37"] },
  { code: "38", nameTh: "บึงกาฬ", nameEn: "Bueng Kan", region: "northeast", zipcodePrefixes: ["38"] },
  { code: "39", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lam Phu", region: "northeast", zipcodePrefixes: ["39"] },
  { code: "40", nameTh: "ขอนแก่น", nameEn: "Khon Kaen", region: "northeast", zipcodePrefixes: ["40"] },
  { code: "41", nameTh: "อุดรธานี", nameEn: "Udon Thani", region: "northeast", zipcodePrefixes: ["41"] },
  { code: "42", nameTh: "เลย", nameEn: "Loei", region: "northeast", zipcodePrefixes: ["42"] },
  { code: "43", nameTh: "หนองคาย", nameEn: "Nong Khai", region: "northeast", zipcodePrefixes: ["43"] },
  { code: "44", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham", region: "northeast", zipcodePrefixes: ["44"] },
  { code: "45", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et", region: "northeast", zipcodePrefixes: ["45"] },
  { code: "46", nameTh: "กาฬสินธุ์", nameEn: "Kalasin", region: "northeast", zipcodePrefixes: ["46"] },
  { code: "47", nameTh: "สกลนคร", nameEn: "Sakon Nakhon", region: "northeast", zipcodePrefixes: ["47"] },
  { code: "48", nameTh: "นครพนม", nameEn: "Nakhon Phanom", region: "northeast", zipcodePrefixes: ["48"] },
  { code: "49", nameTh: "มุกดาหาร", nameEn: "Mukdahan", region: "northeast", zipcodePrefixes: ["49"] },
  { code: "50", nameTh: "เชียงใหม่", nameEn: "Chiang Mai", region: "north", zipcodePrefixes: ["50"] },
  { code: "51", nameTh: "ลำพูน", nameEn: "Lamphun", region: "north", zipcodePrefixes: ["51"] },
  { code: "52", nameTh: "ลำปาง", nameEn: "Lampang", region: "north", zipcodePrefixes: ["52"] },
  { code: "53", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit", region: "north", zipcodePrefixes: ["53"] },
  { code: "54", nameTh: "แพร่", nameEn: "Phrae", region: "north", zipcodePrefixes: ["54"] },
  { code: "55", nameTh: "น่าน", nameEn: "Nan", region: "north", zipcodePrefixes: ["55"] },
  { code: "56", nameTh: "พะเยา", nameEn: "Phayao", region: "north", zipcodePrefixes: ["56"] },
  { code: "57", nameTh: "เชียงราย", nameEn: "Chiang Rai", region: "north", zipcodePrefixes: ["57"] },
  { code: "58", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son", region: "north", zipcodePrefixes: ["58"] },
  { code: "60", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan", region: "central", zipcodePrefixes: ["60"] },
  { code: "61", nameTh: "อุทัยธานี", nameEn: "Uthai Thani", region: "central", zipcodePrefixes: ["61"] },
  { code: "62", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet", region: "north", zipcodePrefixes: ["62"] },
  { code: "63", nameTh: "ตาก", nameEn: "Tak", region: "west", zipcodePrefixes: ["63"] },
  { code: "64", nameTh: "สุโขทัย", nameEn: "Sukhothai", region: "north", zipcodePrefixes: ["64"] },
  { code: "65", nameTh: "พิษณุโลก", nameEn: "Phitsanulok", region: "north", zipcodePrefixes: ["65"] },
  { code: "66", nameTh: "พิจิตร", nameEn: "Phichit", region: "north", zipcodePrefixes: ["66"] },
  { code: "67", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun", region: "north", zipcodePrefixes: ["67"] },
  { code: "70", nameTh: "ราชบุรี", nameEn: "Ratchaburi", region: "west", zipcodePrefixes: ["70"] },
  { code: "71", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi", region: "west", zipcodePrefixes: ["71"] },
  { code: "72", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri", region: "central", zipcodePrefixes: ["72"] },
  { code: "73", nameTh: "นครปฐม", nameEn: "Nakhon Pathom", region: "central", zipcodePrefixes: ["73"] },
  { code: "74", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon", region: "central", zipcodePrefixes: ["74"] },
  { code: "75", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram", region: "central", zipcodePrefixes: ["75"] },
  { code: "76", nameTh: "เพชรบุรี", nameEn: "Phetchaburi", region: "west", zipcodePrefixes: ["76"] },
  { code: "77", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan", region: "west", zipcodePrefixes: ["77"] },
  { code: "80", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat", region: "south", zipcodePrefixes: ["80"] },
  { code: "81", nameTh: "กระบี่", nameEn: "Krabi", region: "south", zipcodePrefixes: ["81"] },
  { code: "82", nameTh: "พังงา", nameEn: "Phangnga", region: "south", zipcodePrefixes: ["82"] },
  { code: "83", nameTh: "ภูเก็ต", nameEn: "Phuket", region: "south", zipcodePrefixes: ["83"] },
  { code: "84", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani", region: "south", zipcodePrefixes: ["84"] },
  { code: "85", nameTh: "ระนอง", nameEn: "Ranong", region: "south", zipcodePrefixes: ["85"] },
  { code: "86", nameTh: "ชุมพร", nameEn: "Chumphon", region: "south", zipcodePrefixes: ["86"] },
  { code: "90", nameTh: "สงขลา", nameEn: "Songkhla", region: "south", zipcodePrefixes: ["90"] },
  { code: "91", nameTh: "สตูล", nameEn: "Satun", region: "south", zipcodePrefixes: ["91"] },
  { code: "92", nameTh: "ตรัง", nameEn: "Trang", region: "south", zipcodePrefixes: ["92"] },
  { code: "93", nameTh: "พัทลุง", nameEn: "Phatthalung", region: "south", zipcodePrefixes: ["93"] },
  { code: "94", nameTh: "ปัตตานี", nameEn: "Pattani", region: "south", zipcodePrefixes: ["94"] },
  { code: "95", nameTh: "ยะลา", nameEn: "Yala", region: "south", zipcodePrefixes: ["95"] },
  { code: "96", nameTh: "นราธิวาส", nameEn: "Narathiwat", region: "south", zipcodePrefixes: ["96"] },
];

export const PROVINCES_BY_CODE: Record<string, Province> = Object.fromEntries(
  PROVINCES.map((p) => [p.code, p]),
);
