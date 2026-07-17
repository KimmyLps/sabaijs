import { describe, expect, it } from "vitest";
import { Collection } from "../src/collection/index.js";

interface Person {
  name: string;
  age: number;
  city: string;
}

const people: Person[] = [
  { name: "Somchai", age: 30, city: "Bangkok" },
  { name: "Suda", age: 25, city: "Chiang Mai" },
  { name: "Anong", age: 35, city: "Bangkok" },
];

describe("Collection", () => {
  it("maps and filters", () => {
    const names = new Collection(people).filter((p) => p.age > 26).map((p) => p.name).all();
    expect(names).toEqual(["Somchai", "Anong"]);
  });

  it("aggregates sum/avg/min/max", () => {
    const col = new Collection(people);
    expect(col.sum("age")).toBe(90);
    expect(col.avg("age")).toBe(30);
    expect(col.min("age")).toBe(25);
    expect(col.max("age")).toBe(35);
  });

  it("groups by key", () => {
    const groups = new Collection(people).groupBy("city");
    expect(groups.get("Bangkok").length).toBe(2);
    expect(groups.get("Chiang Mai").length).toBe(1);
  });

  it("groupBy().get() on a missing key returns an empty Collection, no ?./! needed", () => {
    const groups = new Collection(people).groupBy("city");
    expect(groups.get("Phuket").length).toBe(0);
    expect(groups.get("Bangkok").sortBy("age").pluck("name").all()).toEqual(["Somchai", "Anong"]);
  });

  it("sorts by key", () => {
    const sorted = new Collection(people).sortBy("age").pluck("name").all();
    expect(sorted).toEqual(["Suda", "Somchai", "Anong"]);
  });

  it("chunks into sub-collections", () => {
    const chunks = new Collection([1, 2, 3, 4, 5]).chunkArray(2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("dedupes with unique", () => {
    const unique = new Collection([1, 1, 2, 2, 3]).unique().all();
    expect(unique).toEqual([1, 2, 3]);
  });

  it("partitions by predicate", () => {
    const [adults, minors] = new Collection(people).partition((p) => p.age >= 30);
    expect(adults.pluck("name").all()).toEqual(["Somchai", "Anong"]);
    expect(minors.pluck("name").all()).toEqual(["Suda"]);
  });

  it("filters whereBetween", () => {
    const result = new Collection(people).whereBetween("age", 26, 32).pluck("name").all();
    expect(result).toEqual(["Somchai"]);
  });

  it("paginates", () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    expect(col.paginate(1, 2).all()).toEqual([1, 2]);
    expect(col.paginate(2, 2).all()).toEqual([3, 4]);
    expect(col.paginate(3, 2).all()).toEqual([5]);
  });
});
