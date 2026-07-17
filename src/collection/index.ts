type KeySelector<T> = keyof T | ((item: T) => unknown);

function resolveKey<T>(item: T, selector: KeySelector<T>): unknown {
  return typeof selector === "function" ? selector(item) : item[selector];
}

/**
 * Map of group key -> Collection, as returned by {@link Collection.groupBy}.
 * Unlike a plain Map, `get` always returns a Collection (empty if the key
 * isn't present), so callers can chain straight through without `?.`/`!`.
 */
export class CollectionMap<K, T> implements Iterable<[K, Collection<T>]> {
  private readonly map: Map<K, Collection<T>>;

  constructor(entries: Iterable<[K, Collection<T>]> = []) {
    this.map = new Map(entries);
  }

  [Symbol.iterator](): Iterator<[K, Collection<T>]> {
    return this.map[Symbol.iterator]();
  }

  get(key: K): Collection<T> {
    return this.map.get(key) ?? new Collection<T>();
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  entries(): IterableIterator<[K, Collection<T>]> {
    return this.map.entries();
  }

  get size(): number {
    return this.map.size;
  }
}

/** Laravel Eloquent-inspired fluent collection wrapper for arrays. */
export class Collection<T> implements Iterable<T> {
  private readonly items: T[];

  constructor(items: Iterable<T> = []) {
    this.items = Array.from(items);
  }

  static make<T>(items: Iterable<T> = []): Collection<T> {
    return new Collection(items);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  all(): T[] {
    return [...this.items];
  }

  get length(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  isNotEmpty(): boolean {
    return this.items.length > 0;
  }

  first(predicate?: (item: T) => boolean): T | undefined {
    if (!predicate) return this.items[0];
    return this.items.find(predicate);
  }

  last(predicate?: (item: T) => boolean): T | undefined {
    if (!predicate) return this.items[this.items.length - 1];
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (predicate(this.items[i])) return this.items[i];
    }
    return undefined;
  }

  map<U>(fn: (item: T, index: number) => U): Collection<U> {
    return new Collection(this.items.map(fn));
  }

  filter(fn: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.filter(fn));
  }

  reject(fn: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.filter((item, i) => !fn(item, i)));
  }

  reduce<U>(fn: (acc: U, item: T, index: number) => U, initial: U): U {
    return this.items.reduce(fn, initial);
  }

  each(fn: (item: T, index: number) => void): this {
    this.items.forEach(fn);
    return this;
  }

  pluck<K extends keyof T>(key: K): Collection<T[K]> {
    return new Collection(this.items.map((item) => item[key]));
  }

  sum(selector?: KeySelector<T>): number {
    return this.items.reduce((acc, item) => {
      const value = selector ? resolveKey(item, selector) : item;
      return acc + (Number(value) || 0);
    }, 0);
  }

  avg(selector?: KeySelector<T>): number {
    return this.items.length === 0 ? 0 : this.sum(selector) / this.items.length;
  }

  min(selector?: KeySelector<T>): number | undefined {
    if (this.items.length === 0) return undefined;
    return Math.min(...this.items.map((item) => Number(selector ? resolveKey(item, selector) : item)));
  }

  max(selector?: KeySelector<T>): number | undefined {
    if (this.items.length === 0) return undefined;
    return Math.max(...this.items.map((item) => Number(selector ? resolveKey(item, selector) : item)));
  }

  groupBy(selector: KeySelector<T>): CollectionMap<unknown, T> {
    const groups = new Map<unknown, T[]>();
    for (const item of this.items) {
      const key = resolveKey(item, selector);
      const bucket = groups.get(key);
      if (bucket) bucket.push(item);
      else groups.set(key, [item]);
    }
    return new CollectionMap([...groups].map(([key, value]) => [key, new Collection(value)]));
  }

  keyBy<K>(selector: KeySelector<T>): Map<K, T> {
    const map = new Map<K, T>();
    for (const item of this.items) {
      map.set(resolveKey(item, selector) as K, item);
    }
    return map;
  }

  sortBy(selector: KeySelector<T>, direction: "asc" | "desc" = "asc"): Collection<T> {
    const sorted = [...this.items].sort((a, b) => {
      const va = resolveKey(a, selector);
      const vb = resolveKey(b, selector);
      if (va === vb) return 0;
      const result = va! > vb! ? 1 : -1;
      return direction === "asc" ? result : -result;
    });
    return new Collection(sorted);
  }

  unique(selector?: KeySelector<T>): Collection<T> {
    const seen = new Set<unknown>();
    const result: T[] = [];
    for (const item of this.items) {
      const key = selector ? resolveKey(item, selector) : item;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return new Collection(result);
  }

  partition(fn: (item: T, index: number) => boolean): [Collection<T>, Collection<T>] {
    const pass: T[] = [];
    const fail: T[] = [];
    this.items.forEach((item, i) => (fn(item, i) ? pass : fail).push(item));
    return [new Collection(pass), new Collection(fail)];
  }

  whereBetween(selector: KeySelector<T>, min: number, max: number): Collection<T> {
    return this.filter((item) => {
      const value = Number(resolveKey(item, selector));
      return value >= min && value <= max;
    });
  }

  paginate(page: number, perPage: number): Collection<T> {
    const start = (page - 1) * perPage;
    return new Collection(this.items.slice(start, start + perPage));
  }

  chunk(size: number): Collection<Collection<T>> {
    if (size <= 0) throw new Error("chunk size must be greater than 0");
    const chunks: T[][] = [];
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size));
    }
    return new Collection(chunks.map((c) => new Collection(c)));
  }

  chunkArray(size: number): T[][] {
    return this.chunk(size).all().map((c) => c.all());
  }

  flatten<U = unknown>(): Collection<U> {
    return new Collection((this.items as unknown[]).flat() as U[]);
  }

  contains(value: T | ((item: T) => boolean)): boolean {
    if (typeof value === "function") {
      return this.items.some(value as (item: T) => boolean);
    }
    return this.items.includes(value);
  }

  toArray(): T[] {
    return this.all();
  }

  toJSON(): T[] {
    return this.all();
  }
}
