import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export interface BatchProcessOptions {
  /** Max number of files processed concurrently (default: 5). */
  concurrency?: number;
  /** Recurse into subdirectories (default: false). */
  recursive?: boolean;
  /** Filter which discovered file paths get processed. */
  filter?: (filePath: string) => boolean;
  /** Called after each file settles (success or failure). */
  onProgress?: (done: number, total: number, filePath: string) => void;
}

export interface BatchResult<T> {
  filePath: string;
  status: "fulfilled" | "rejected";
  value?: T;
  reason?: unknown;
}

async function collectFiles(dir: string, recursive: boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) files.push(...(await collectFiles(fullPath, recursive)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Process every file in a directory through `handler`, running up to
 * `concurrency` handlers in parallel. Never throws — failures are captured
 * per-file in the returned results array.
 */
export async function batchProcessDirectory<T>(
  dirPath: string,
  handler: (filePath: string) => Promise<T>,
  options: BatchProcessOptions = {},
): Promise<BatchResult<T>[]> {
  const { concurrency = 5, recursive = false, filter, onProgress } = options;

  const stats = await stat(dirPath);
  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${dirPath}`);
  }

  let files = await collectFiles(dirPath, recursive);
  if (filter) files = files.filter(filter);

  return batchProcessFiles(files, handler, { concurrency, onProgress });
}

/** Process an explicit list of file paths through `handler` with bounded concurrency. */
export async function batchProcessFiles<T>(
  files: string[],
  handler: (filePath: string) => Promise<T>,
  options: Pick<BatchProcessOptions, "concurrency" | "onProgress"> = {},
): Promise<BatchResult<T>[]> {
  const { concurrency = 5, onProgress } = options;
  const results: BatchResult<T>[] = new Array(files.length);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < files.length) {
      const index = cursor++;
      const filePath = files[index];
      try {
        const value = await handler(filePath);
        results[index] = { filePath, status: "fulfilled", value };
      } catch (reason) {
        results[index] = { filePath, status: "rejected", reason };
      }
      done++;
      onProgress?.(done, files.length, filePath);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Split an array into fixed-size chunks — useful for manual batch pipelines. */
export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new Error("chunk size must be greater than 0");
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
