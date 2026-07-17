import { describe, expect, it } from "vitest";
import { formatThaiAddress, parseThaiAddress } from "../src/address/index.js";

describe("parseThaiAddress", () => {
  it("parses a full Bangkok address", () => {
    const result = parseThaiAddress(
      "123/45 หมู่ 6 ซอยลาดพร้าว 101 ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240",
    );
    expect(result.houseNumber).toBe("123/45");
    expect(result.moo).toBe("6");
    expect(result.soi).toBe("ลาดพร้าว 101");
    expect(result.road).toBe("ลาดพร้าว");
    expect(result.subDistrict).toBe("คลองจั่น");
    expect(result.district).toBe("บางกะปิ");
    expect(result.province).toBe("กรุงเทพมหานคร");
    expect(result.postalCode).toBe("10240");
    expect(result.isComplete).toBe(true);
  });

  it("parses an upcountry address with จังหวัด keyword", () => {
    const result = parseThaiAddress(
      "99 หมู่ 3 ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ 10540",
    );
    expect(result.subDistrict).toBe("บางพลี");
    expect(result.district).toBe("บางพลี");
    expect(result.province).toBe("สมุทรปราการ");
    expect(result.provinceInfo?.nameEn).toBe("Samut Prakan");
    expect(result.isComplete).toBe(true);
  });

  it("marks incomplete addresses", () => {
    const result = parseThaiAddress("123 ถนนสุขุมวิท");
    expect(result.isComplete).toBe(false);
  });

  it("parses condo-style addresses with building/floor/room/village", () => {
    const result = parseThaiAddress(
      "88 หมู่บ้านสุขสันต์ อาคารเอ ชั้น 12 ห้อง 1201 ซอยสุขุมวิท 24 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110",
    );
    expect(result.houseNumber).toBe("88");
    expect(result.village).toBe("สุขสันต์");
    expect(result.building).toBe("เอ");
    expect(result.floor).toBe("12");
    expect(result.room).toBe("1201");
    expect(result.soi).toBe("สุขุมวิท 24");
    expect(result.isComplete).toBe(true);
  });

  it("recognizes the บ้านเลขที่ house-number keyword", () => {
    const result = parseThaiAddress(
      "บ้านเลขที่ 45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110",
    );
    expect(result.houseNumber).toBe("45");
  });

  it("parses a PO box reference", () => {
    const result = parseThaiAddress("ตู้ ปณ. 111 ปณจ.บางรัก กรุงเทพมหานคร 10500");
    expect(result.poBox).toBe("111");
  });

  it("resolves the precise sub-district record and fills a missing postal code", () => {
    const result = parseThaiAddress("99 หมู่ 3 ตำบลบางแก้ว อำเภอบางพลี จังหวัดสมุทรปราการ");
    expect(result.subDistrictInfo?.nameTh).toBe("บางแก้ว");
    expect(result.postalCode).toBe("10540");
    expect(result.postalCode).toBe(result.subDistrictInfo?.zipcode);
    expect(result.isComplete).toBe(true);
  });

  const cases: Array<[string, Partial<ReturnType<typeof parseThaiAddress>>]> = [
    [
      "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      {
        houseNumber: "123",
        road: "สุขุมวิท",
        subDistrict: "คลองเตย",
        district: "คลองเตย",
        province: "กรุงเทพมหานคร",
        postalCode: "10110",
      },
    ],
    [
      "99/1 หมู่ 5 ซอยลาดพร้าว 15 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900",
      {
        houseNumber: "99/1",
        moo: "5",
        soi: "ลาดพร้าว 15",
        road: "ลาดพร้าว",
        subDistrict: "จอมพล",
        district: "จตุจักร",
        province: "กรุงเทพมหานคร",
        postalCode: "10900",
      },
    ],
    [
      "เลขที่ 1 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 25 ห้อง 2501 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120",
      {
        houseNumber: "1",
        building: "เอ็มไพร์ทาวเวอร์",
        floor: "25",
        room: "2501",
        road: "สาทรใต้",
        subDistrict: "ยานนาวา",
        district: "สาทร",
        province: "กรุงเทพมหานคร",
        postalCode: "10120",
      },
    ],
    [
      "88/8 หมู่บ้านสวนทอง ม.3 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ 10540",
      {
        houseNumber: "88/8",
        village: "สวนทอง",
        moo: "3",
        subDistrict: "บางพลีใหญ่",
        district: "บางพลี",
        province: "สมุทรปราการ",
        postalCode: "10540",
      },
    ],
    [
      "55 ซ.อารีย์ 2 แยกพหลโยธิน ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
      {
        houseNumber: "55",
        soi: "อารีย์ 2",
        yaek: "พหลโยธิน",
        road: "พหลโยธิน",
        subDistrict: "สามเสนใน",
        district: "พญาไท",
        province: "กรุงเทพมหานคร",
        postalCode: "10400",
      },
    ],
    [
      "19 ตำบลในเมือง อำเภอเมืองขอนแก่น ขอนแก่น 40000",
      {
        houseNumber: "19",
        subDistrict: "ในเมือง",
        district: "เมืองขอนแก่น",
        province: "ขอนแก่น",
        postalCode: "40000",
      },
    ],
    [
      "7 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200",
      {
        houseNumber: "7",
        road: "นิมมานเหมินท์",
        subDistrict: "สุเทพ",
        district: "เมือง",
        province: "เชียงใหม่",
        postalCode: "50200",
      },
    ],
  ];

  it.each(cases)("parses %s", (input, expected) => {
    const result = parseThaiAddress(input);
    expect(result).toMatchObject(expected);
  });
});

describe("formatThaiAddress", () => {
  it("builds a Bangkok address using แขวง/เขต", () => {
    const address = formatThaiAddress({
      houseNumber: "123/45",
      moo: "6",
      soi: "ลาดพร้าว 101",
      road: "ลาดพร้าว",
      subDistrict: "คลองจั่น",
      district: "บางกะปิ",
      province: "กรุงเทพมหานคร",
      postalCode: "10240",
    });
    expect(address).toBe(
      "123/45 หมู่ 6 ซอยลาดพร้าว 101 ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240",
    );
  });

  it("builds an upcountry address using ตำบล/อำเภอ/จังหวัด", () => {
    const address = formatThaiAddress({
      houseNumber: "99",
      moo: "3",
      subDistrict: "บางพลี",
      district: "บางพลี",
      province: "สมุทรปราการ",
      postalCode: "10540",
    });
    expect(address).toBe("99 หมู่ 3 ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ 10540");
  });

  it("round-trips through parseThaiAddress", () => {
    const original = "123/45 หมู่ 6 ซอยลาดพร้าว 101 ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240";
    const parsed = parseThaiAddress(original);
    const rebuilt = formatThaiAddress({
      houseNumber: parsed.houseNumber,
      moo: parsed.moo,
      soi: parsed.soi,
      road: parsed.road,
      subDistrict: parsed.subDistrict!,
      district: parsed.district!,
      province: parsed.province!,
      postalCode: parsed.postalCode!,
    });
    expect(rebuilt).toBe(original);
  });
});
