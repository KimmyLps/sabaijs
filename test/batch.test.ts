import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { batchProcessDirectory, batchProcessFiles, chunkArray } from "../src/batch/index.js";

describe("chunkArray", () => {
  it("splits into fixed-size chunks", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("batch file processing", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "thai-toolkit-"));
    await writeFile(path.join(dir, "a.txt"), "hello");
    await writeFile(path.join(dir, "b.txt"), "world");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("processes every file in a directory with bounded concurrency", async () => {
    const results = await batchProcessDirectory(
      dir,
      async (filePath) => (await readFile(filePath, "utf8")).toUpperCase(),
      { concurrency: 2 },
    );
    const values = results.map((r) => r.value).sort();
    expect(values).toEqual(["HELLO", "WORLD"]);
  });

  it("captures per-file failures without throwing", async () => {
    const results = await batchProcessFiles(
      [path.join(dir, "a.txt"), path.join(dir, "missing.txt")],
      (filePath) => readFile(filePath, "utf8"),
    );
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
  });
});
