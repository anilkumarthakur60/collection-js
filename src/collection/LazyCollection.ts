import type { Enumerable } from '../contracts/Enumerable'
import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'
import { applyMacroable, type MacroableTarget } from '../macros/Macroable'
import * as ops from '../operations'
import { dataGet } from '../support/dataGet'
import { deepEqual, looseEqual } from '../support/deepEqual'
import { isPlainObject } from '../support/isObject'
import { operatorForWhere } from '../support/operatorForWhere'
import type { ClassConstructor, Comparator, Predicate } from '../support/types'
import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'
import { Collection, setLazyConstructor } from './Collection'

export type LazySource<T> = Iterable<T> | (() => Iterable<T>)

/**
 * Normalize a source so each `source()` invocation produces a fresh iterable.
 * Concrete arrays/sets/maps are inherently re-iterable. One-shot iterators
 * (live generators) are materialised to an array up front to preserve the
 * "iterate-many-times" contract that operations like `count()` then `each()`
 * implicitly rely on.
 */
function resolveSource<T>(source: LazySource<T>): () => Iterable<T> {
  if (typeof source === 'function') return source
  if (Array.isArray(source) || source instanceof Set || source instanceof Map) {
    return () => source as Iterable<T>
  }
  // Other iterables — be defensive: snapshot to array so re-iteration works.
  const snapshot = Array.from(source as Iterable<T>)
  return () => snapshot
}

/**
 * Lazy generator-backed collection. Mirrors Laravel's `LazyCollection`.
 * The same fluent surface as `Collection`, but every method that returns a new
 * collection returns a `LazyCollection` over a generator — values are produced
 * on demand. Mutating methods (push/pop/etc.) are intentionally absent.
 */
export class LazyCollection<T> implements Enumerable<T> {
  private readonly source: () => Iterable<T>

  constructor(source: LazySource<T> = []) {
    this.source = resolveSource<T>(source)
  }

  [Symbol.iterator](): Iterator<T> {
    return this.source()[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): string {
    return 'LazyCollection'
  }

  // ─── Static factories ───────────────────────────────────────────────────────
  static make<T>(source: LazySource<T> = []): LazyCollection<T> {
    return new LazyCollection<T>(source)
  }
  static empty<T>(): LazyCollection<T> {
    return new LazyCollection<T>([])
  }
  static range(start: number, end: number, step: number = 1): LazyCollection<number> {
    return new LazyCollection<number>(function* () {
      if (step === 0) throw new RangeError('range step must not be zero')
      if (step > 0) for (let i = start; i <= end; i += step) yield i
      else for (let i = start; i >= end; i += step) yield i
    })
  }
  static times<T>(count: number, factory: (n: number) => T): LazyCollection<T> {
    return new LazyCollection<T>(function* () {
      for (let i = 1; i <= count; i++) yield factory(i)
    })
  }
  static wrap<T>(
    value: T | T[] | Iterable<T> | LazyCollection<T> | null | undefined
  ): LazyCollection<T> {
    if (value instanceof LazyCollection) return value
    if (value == null) return LazyCollection.empty()
    if (typeof value === 'object' && value !== null && Symbol.iterator in (value as object)) {
      return new LazyCollection<T>(value as Iterable<T>)
    }
    return new LazyCollection<T>([value as T])
  }
  static unwrap<T>(value: T | T[] | LazyCollection<T>): T | T[] {
    if (value instanceof LazyCollection) return value.toArray()
    return value
  }

  // ─── Conversion ─────────────────────────────────────────────────────────────
  all(): T[] {
    return [...this.source()]
  }
  toArray(): T[] {
    return this.all()
  }
  toJson(): string {
    return JSON.stringify(this.all())
  }
  toJSON(): T[] {
    return this.all()
  }
  toMap<K, V>(keyFn: (item: T, i: number) => K, valueFn: (item: T, i: number) => V): Map<K, V> {
    const out = new Map<K, V>()
    let i = 0
    for (const item of this.source()) {
      out.set(keyFn(item, i), valueFn(item, i))
      i++
    }
    return out
  }
  toSet(): Set<T> {
    return new Set(this.source())
  }
  collect(): Collection<T> {
    return new Collection(this.all())
  }

  // ─── Inspection (consume the generator) ────────────────────────────────────
  count(): number {
    let n = 0
    const it = this.source()[Symbol.iterator]()
    for (let next = it.next(); !next.done; next = it.next()) n++
    return n
  }
  isEmpty(): boolean {
    const it = this.source()[Symbol.iterator]()
    return it.next().done === true
  }
  isNotEmpty(): boolean {
    return !this.isEmpty()
  }

  countBy(by?: RetrieverInput<T>): Record<string, number> {
    const get = valueRetriever<T, unknown>(by)
    const out: Record<string, number> = {}
    let i = 0
    for (const item of this.source()) {
      const k = String(get(item, i))
      out[k] = (out[k] ?? 0) + 1
      i++
    }
    return out
  }

  // ─── Retrieval ──────────────────────────────────────────────────────────────
  first(predicate?: Predicate<T>): T | undefined {
    let i = 0
    for (const item of this.source()) {
      if (predicate === undefined || predicate(item, i)) return item
      i++
    }
    return undefined
  }

  firstOrFail(predicate?: Predicate<T>): T {
    const r = this.first(predicate)
    if (r === undefined) throw new ItemNotFoundException()
    return r
  }

  firstWhere(key: string, ...rest: readonly unknown[]): T | undefined {
    const spec = ops.buildFirstWhereSpec(rest[0], rest[1], rest.length + 1)
    for (const item of this.source()) {
      const v = dataGet(item, key)
      const matched = spec.truthy ? Boolean(v) : operatorForWhere(v, spec.operator, spec.value)
      if (matched) return item
    }
    return undefined
  }

  last(predicate?: Predicate<T>): T | undefined {
    let last: T | undefined = undefined
    let i = 0
    for (const item of this.source()) {
      if (predicate === undefined || predicate(item, i)) last = item
      i++
    }
    return last
  }

  sole(predicate?: Predicate<T> | string, expected?: unknown): T {
    return ops.soleOf(this.all(), predicate, expected)
  }

  random(): T | undefined {
    return ops.randomOne(this.all())
  }

  // ─── Search & inspection ────────────────────────────────────────────────────
  contains(target: unknown, ...rest: readonly unknown[]): boolean {
    const spec = ops.resolveContainsSpec<T>(target as ops.ContainsArg<T>, rest[0], rest.length >= 1)
    return ops.containsOf(this.all(), spec, false)
  }
  containsStrict(target: unknown, ...rest: readonly unknown[]): boolean {
    const spec = ops.resolveContainsSpec<T>(target as ops.ContainsArg<T>, rest[0], rest.length >= 1)
    return ops.containsOf(this.all(), spec, true)
  }
  doesntContain(target: unknown, ...rest: readonly unknown[]): boolean {
    return !this.contains(target, ...rest)
  }

  every(predicate: Predicate<T>): boolean {
    let i = 0
    for (const item of this.source()) {
      if (!predicate(item, i)) return false
      i++
    }
    return true
  }
  some(predicate: Predicate<T>): boolean {
    let i = 0
    for (const item of this.source()) {
      if (predicate(item, i)) return true
      i++
    }
    return false
  }
  search(target: T | Predicate<T>, strict = false): number | false {
    return ops.searchOf(this.all(), target, strict)
  }
  has(key: string | readonly string[]): boolean {
    return ops.hasKey(this.all(), Array.isArray(key) ? (key as readonly string[]) : [key as string])
  }

  // ─── Aggregation ────────────────────────────────────────────────────────────
  sum(by?: RetrieverInput<T, number>): number {
    return ops.sumOf(this.all(), by)
  }
  average(by?: RetrieverInput<T, number>): number {
    return ops.averageOf(this.all(), by)
  }
  avg(by?: RetrieverInput<T, number>): number {
    return ops.averageOf(this.all(), by)
  }
  max(by?: RetrieverInput<T, number>): number | undefined {
    return ops.maxOf(this.all(), by)
  }
  min(by?: RetrieverInput<T, number>): number | undefined {
    return ops.minOf(this.all(), by)
  }
  median(by?: RetrieverInput<T, number>): number | undefined {
    return ops.medianOf(this.all(), by)
  }
  mode(by?: RetrieverInput<T>): unknown[] | undefined {
    return ops.modeOf(this.all(), by)
  }
  percentage(predicate: Predicate<T>, precision: number = 2): number {
    return ops.percentageOf(this.all(), predicate, precision)
  }

  // ─── Filtering ──────────────────────────────────────────────────────────────
  filter(predicate?: Predicate<T>): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of src()) {
        if (predicate === undefined ? Boolean(item) : predicate(item, i)) yield item
        i++
      }
    })
  }

  reject(predicate: Predicate<T>): LazyCollection<T> {
    return this.filter((item, i) => !predicate(item, i))
  }

  where(key: string, ...rest: readonly unknown[]): LazyCollection<T> {
    const spec = ops.buildWhereSpec([key, ...rest], false)
    return this.filter((item) =>
      spec.truthy
        ? Boolean(dataGet(item, key))
        : operatorForWhere(dataGet(item, key), spec.operator, spec.value)
    )
  }

  whereStrict(key: string, value: unknown): LazyCollection<T> {
    const spec = ops.buildWhereSpec([key, value], true)
    return this.filter((item) => operatorForWhere(dataGet(item, key), spec.operator, spec.value))
  }

  whereIn(key: string, values: readonly unknown[], strict = false): LazyCollection<T> {
    return this.filter((item) => {
      const got = dataGet(item, key)
      return values.some((v) => (strict ? v === got || deepEqual(v, got) : looseEqual(v, got)))
    })
  }
  whereInStrict(key: string, values: readonly unknown[]): LazyCollection<T> {
    return this.whereIn(key, values, true)
  }
  whereNotIn(key: string, values: readonly unknown[], strict = false): LazyCollection<T> {
    return this.filter((item) => {
      const got = dataGet(item, key)
      return !values.some((v) => (strict ? v === got || deepEqual(v, got) : looseEqual(v, got)))
    })
  }
  whereNotInStrict(key: string, values: readonly unknown[]): LazyCollection<T> {
    return this.whereNotIn(key, values, true)
  }

  whereBetween(key: string, range: readonly [unknown, unknown]): LazyCollection<T> {
    return this.filter((item) => {
      const got = dataGet(item, key)
      return (got as number) >= (range[0] as number) && (got as number) <= (range[1] as number)
    })
  }

  whereNotBetween(key: string, range: readonly [unknown, unknown]): LazyCollection<T> {
    return this.filter((item) => {
      const got = dataGet(item, key)
      return (got as number) < (range[0] as number) || (got as number) > (range[1] as number)
    })
  }

  whereNull(key: string): LazyCollection<T> {
    return this.filter((item) => dataGet(item, key) == null)
  }
  whereNotNull(key: string): LazyCollection<T> {
    return this.filter((item) => dataGet(item, key) != null)
  }

  whereInstanceOf<R>(
    Ctor: ClassConstructor<R> | (abstract new (...args: never[]) => R)
  ): LazyCollection<R> {
    type AnyCtor = abstract new (...args: never[]) => unknown
    const ctor = Ctor as AnyCtor
    const src = this.source
    return new LazyCollection<R>(function* () {
      for (const item of src()) {
        if (item instanceof ctor) yield item as unknown as R
      }
    })
  }

  // ─── Transformation ─────────────────────────────────────────────────────────
  map<R>(fn: (item: T, index: number) => R): LazyCollection<R> {
    const src = this.source
    return new LazyCollection<R>(function* () {
      let i = 0
      for (const item of src()) {
        yield fn(item, i)
        i++
      }
    })
  }

  mapInto<R>(Ctor: ClassConstructor<R, [T]>): LazyCollection<R> {
    return this.map((item) => new Ctor(item))
  }

  mapSpread<R>(fn: (...args: T extends readonly unknown[] ? T : never) => R): LazyCollection<R> {
    return this.map((item) => fn(...(item as unknown as T extends readonly unknown[] ? T : never)))
  }

  mapWithKeys<K extends PropertyKey, V>(
    fn: (item: T, index: number) => readonly [K, V]
  ): Record<K, V> {
    return ops.mapWithKeysOf(this.all(), fn)
  }

  mapToGroups<K extends PropertyKey, V>(
    fn: (item: T, index: number) => readonly [K, V]
  ): Record<K, V[]> {
    return ops.mapToGroupsOf(this.all(), fn)
  }

  flatMap<R>(fn: (item: T, index: number) => R | readonly R[]): LazyCollection<R> {
    const src = this.source
    return new LazyCollection<R>(function* () {
      let i = 0
      for (const item of src()) {
        const r = fn(item, i)
        if (Array.isArray(r)) yield* r as readonly R[]
        else yield r as R
        i++
      }
    })
  }

  flatten(depth: number = Infinity): LazyCollection<unknown> {
    const src = this.source
    function* helper(it: Iterable<unknown>, remaining: number): Generator<unknown> {
      for (const v of it) {
        if (Array.isArray(v) && remaining > 0) yield* helper(v, remaining - 1)
        else if (isPlainObject(v) && remaining > 0)
          yield* helper(Object.values(v as Record<string, unknown>), remaining - 1)
        else yield v
      }
    }
    return new LazyCollection<unknown>(() => helper(src() as Iterable<unknown>, depth))
  }

  collapse<U>(this: LazyCollection<readonly U[] | U>): LazyCollection<U> {
    const src = this.source
    return new LazyCollection<U>(function* () {
      for (const v of src()) {
        if (Array.isArray(v)) yield* v as readonly U[]
        else yield v as U
      }
    })
  }

  pluck(key: string): LazyCollection<unknown>
  pluck(key: string, keyBy: string): Record<string, unknown>
  pluck(key: string, keyBy?: string): LazyCollection<unknown> | Record<string, unknown> {
    if (keyBy === undefined) {
      const src = this.source
      return new LazyCollection<unknown>(function* () {
        for (const item of src()) yield dataGet(item, key)
      })
    }
    const out: Record<string, unknown> = {}
    for (const item of this.source()) out[String(dataGet(item, keyBy))] = dataGet(item, key)
    return out
  }

  // ─── Slice / take / skip ────────────────────────────────────────────────────
  take(count: number): LazyCollection<T> {
    if (count < 0) return new LazyCollection<T>(this.all().slice(count))
    const src = this.source
    return new LazyCollection<T>(function* () {
      if (count <= 0) return
      // Use a manual iterator so we never pull an extra value past the limit —
      // important for `remember()`, throttling, and infinite generators.
      const it = src()[Symbol.iterator]()
      let n = 0
      while (n < count) {
        const next = it.next()
        if (next.done) return
        yield next.value
        n++
      }
    })
  }

  takeUntil(target: T | Predicate<T>): LazyCollection<T> {
    const src = this.source
    const isFn = typeof target === 'function'
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of src()) {
        if (isFn ? (target as Predicate<T>)(item, i) : looseEqual(item, target)) return
        yield item
        i++
      }
    })
  }

  takeWhile(predicate: Predicate<T>): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of src()) {
        if (!predicate(item, i)) return
        yield item
        i++
      }
    })
  }

  skip(count: number): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let n = 0
      for (const item of src()) {
        if (n >= count) yield item
        n++
      }
    })
  }

  skipUntil(target: T | Predicate<T>): LazyCollection<T> {
    const src = this.source
    const isFn = typeof target === 'function'
    return new LazyCollection<T>(function* () {
      let started = false
      let i = 0
      for (const item of src()) {
        if (!started) {
          if (isFn ? (target as Predicate<T>)(item, i) : looseEqual(item, target)) started = true
          else {
            i++
            continue
          }
        }
        yield item
        i++
      }
    })
  }

  skipWhile(predicate: Predicate<T>): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let started = false
      let i = 0
      for (const item of src()) {
        if (!started && predicate(item, i)) {
          i++
          continue
        }
        started = true
        yield item
        i++
      }
    })
  }

  slice(start: number, length?: number): LazyCollection<T> {
    if (start < 0 || (length !== undefined && length < 0))
      return new LazyCollection<T>(ops.sliceOf(this.all(), start, length))
    return this.skip(start).take(length === undefined ? Infinity : length)
  }

  forPage(page: number, perPage: number): LazyCollection<T> {
    return this.skip((page - 1) * perPage).take(perPage)
  }

  nth(step: number, offset: number = 0): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of src()) {
        if (i >= offset && (i - offset) % step === 0) yield item
        i++
      }
    })
  }

  // ─── Chunking ───────────────────────────────────────────────────────────────
  chunk(size: number): LazyCollection<LazyCollection<T>> {
    const src = this.source
    return new LazyCollection<LazyCollection<T>>(function* () {
      let buf: T[] = []
      for (const item of src()) {
        buf.push(item)
        if (buf.length === size) {
          yield new LazyCollection<T>([...buf])
          buf = []
        }
      }
      if (buf.length > 0) yield new LazyCollection<T>(buf)
    })
  }

  chunkWhile(
    predicate: (item: T, key: number, chunk: readonly T[]) => boolean
  ): LazyCollection<LazyCollection<T>> {
    return new LazyCollection<LazyCollection<T>>(
      ops.chunkWhileOf(this.all(), predicate).map((c) => new LazyCollection<T>(c))
    )
  }

  partition(predicate: Predicate<T>): [LazyCollection<T>, LazyCollection<T>] {
    const items = this.all()
    const [a, b] = ops.partitionOf(items, predicate)
    return [new LazyCollection(a), new LazyCollection(b)]
  }

  groupBy(by: RetrieverInput<T, PropertyKey | readonly PropertyKey[]>): Record<PropertyKey, T[]> {
    return ops.groupByOf<T, PropertyKey>(this.all(), by)
  }
  keyBy(by: RetrieverInput<T, PropertyKey>): Record<PropertyKey, T> {
    return ops.keyByOf<T, PropertyKey>(this.all(), by)
  }
  split(groups: number): LazyCollection<LazyCollection<T>> {
    return new LazyCollection<LazyCollection<T>>(
      ops.splitOf(this.all(), groups).map((c) => new LazyCollection<T>(c))
    )
  }
  splitIn(groups: number): LazyCollection<LazyCollection<T>> {
    return new LazyCollection<LazyCollection<T>>(
      ops.splitInOf(this.all(), groups).map((c) => new LazyCollection<T>(c))
    )
  }

  // ─── Sorting (forces materialisation) ──────────────────────────────────────
  sort(comparator?: Comparator<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.sortOf(this.all(), comparator))
  }
  sortDesc(): LazyCollection<T> {
    return new LazyCollection<T>(ops.sortDescOf(this.all()))
  }
  sortBy(spec: ops.SortBySpec<T> | readonly ops.SortBySpec<T>[]): LazyCollection<T> {
    return new LazyCollection<T>(ops.sortByOf(this.all(), spec))
  }
  sortByDesc(spec: ops.SortBySpec<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.sortByDescOf(this.all(), spec))
  }
  sortKeys(): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.sortKeysOf(this.all() as unknown as readonly object[]) as unknown as T[]
    )
  }
  sortKeysDesc(): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.sortKeysOf(this.all() as unknown as readonly object[], true) as unknown as T[]
    )
  }
  reverse(): LazyCollection<T> {
    return new LazyCollection<T>(ops.reverseOf(this.all()))
  }
  shuffle(random?: () => number): LazyCollection<T> {
    return new LazyCollection<T>(ops.shuffleOf(this.all(), random))
  }
  values(): LazyCollection<T> {
    return new LazyCollection<T>(this.all())
  }
  keys(): LazyCollection<string> {
    return new LazyCollection<string>(ops.keysOf(this.all()))
  }

  // ─── Set operations (force materialisation) ────────────────────────────────
  diff(other: readonly T[] | LazyCollection<T> | Collection<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.diffOf(this.all(), this.materialise(other)))
  }
  diffAssoc(other: readonly Partial<T>[] | LazyCollection<Partial<T>>): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.diffAssocOf(this.all(), this.materialise(other) as readonly Partial<T>[])
    )
  }
  diffKeys(otherKeys: readonly string[]): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.diffKeysOf(this.all() as unknown as readonly object[], otherKeys) as unknown as T[]
    )
  }
  intersect(other: readonly T[] | LazyCollection<T> | Collection<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.intersectOf(this.all(), this.materialise(other)))
  }
  intersectAssoc(other: readonly Partial<T>[] | LazyCollection<Partial<T>>): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.intersectAssocOf(
        this.all() as unknown as readonly object[],
        this.materialise(other) as readonly Partial<object>[]
      ) as unknown as T[]
    )
  }
  intersectByKeys(keys: readonly string[]): LazyCollection<T> {
    return new LazyCollection<T>(
      ops.intersectByKeysOf(this.all() as unknown as readonly object[], keys) as unknown as T[]
    )
  }
  union(other: readonly T[] | LazyCollection<T> | Collection<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.unionOf(this.all(), this.materialise(other)))
  }
  crossJoin<U>(...others: readonly (readonly U[])[]): LazyCollection<(T | U)[]> {
    return new LazyCollection<(T | U)[]>(
      ops.crossJoinOf<T | U>(
        this.all() as readonly (T | U)[],
        ...(others as readonly (readonly (T | U)[])[])
      )
    )
  }
  unique(by?: RetrieverInput<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.uniqueOf(this.all(), by, false))
  }
  uniqueStrict(by?: RetrieverInput<T>): LazyCollection<T> {
    return new LazyCollection<T>(ops.uniqueStrictOf(this.all(), by))
  }
  duplicates(by?: RetrieverInput<T>): Record<number, T> {
    return new Collection(this.all()).duplicates(by)
  }
  duplicatesStrict(by?: RetrieverInput<T>): Record<number, T> {
    return new Collection(this.all()).duplicatesStrict(by)
  }

  only(keys: readonly string[]): LazyCollection<Partial<T>> {
    return new LazyCollection<Partial<T>>(
      ops.onlyOf(this.all() as unknown as readonly object[], keys) as Partial<T>[]
    )
  }
  except(keys: readonly string[]): LazyCollection<Partial<T>> {
    return new LazyCollection<Partial<T>>(
      ops.exceptOf(this.all() as unknown as readonly object[], keys) as Partial<T>[]
    )
  }

  flip(): LazyCollection<Record<string, number>> {
    return new LazyCollection<Record<string, number>>([
      ops.flipOf(this.all() as readonly unknown[])
    ])
  }

  pad(size: number, value: T): LazyCollection<T> {
    return new LazyCollection<T>(ops.padOf(this.all(), size, value))
  }
  multiply(factor: number): LazyCollection<T> {
    return new LazyCollection<T>(ops.multiplyOf(this.all(), factor))
  }

  combine<V>(values: readonly V[] | LazyCollection<V> | Collection<V>): Record<string, V> {
    const list = this.materialise(values)
    return ops.combineOf(this.all().map(String) as readonly string[], list)
  }

  zip<U>(
    values: readonly U[] | LazyCollection<U> | Collection<U>
  ): LazyCollection<[T, U | undefined]> {
    return new LazyCollection<[T, U | undefined]>(ops.zipOf(this.all(), this.materialise(values)))
  }

  concat<U>(other: readonly U[] | LazyCollection<U> | Collection<U>): LazyCollection<T | U> {
    const list = this.materialise<U>(other as readonly U[] | LazyCollection<U> | Collection<U>)
    const src = this.source
    return new LazyCollection<T | U>(function* () {
      for (const item of src()) yield item as T | U
      for (const item of list) yield item as T | U
    })
  }

  merge<U>(
    ...sources: readonly (readonly U[] | LazyCollection<U> | Collection<U>)[]
  ): LazyCollection<T | U> {
    let acc: (T | U)[] = [...this.all()] as (T | U)[]
    for (const s of sources) acc = ops.mergeOf(acc as readonly T[], this.materialise<U>(s))
    return new LazyCollection<T | U>(acc)
  }

  // ─── Iteration helpers ──────────────────────────────────────────────────────
  each(callback: (item: T, index: number) => void | false): this {
    let i = 0
    for (const item of this.source()) {
      if (callback(item, i) === false) break
      i++
    }
    return this
  }

  /** Lazy: only fires as items are pulled out of subsequent operators. */
  tapEach(callback: (item: T, index: number) => void): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of src()) {
        callback(item, i)
        yield item
        i++
      }
    })
  }

  // ─── Reduction ──────────────────────────────────────────────────────────────
  reduce<R>(fn: (carry: R, item: T, index: number) => R, initial: R): R {
    return ops.reduceOf(this.all(), fn, initial)
  }
  pipe<R>(callback: (collection: this) => R): R {
    return callback(this)
  }
  pipeInto<R>(Ctor: ClassConstructor<R, [this]>): R {
    return new Ctor(this)
  }
  pipeThrough(pipes: readonly ((value: unknown) => unknown)[]): unknown {
    return pipes.reduce<unknown>((carry, pipe) => pipe(carry), this)
  }
  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  // ─── String operations ──────────────────────────────────────────────────────
  implode(
    glueOrFormatter: string | ((item: T, index: number) => string),
    keyOrSeparator?: string
  ): string {
    if (typeof glueOrFormatter === 'function')
      return ops.implodeOf(this.all(), glueOrFormatter, keyOrSeparator ?? '')
    return ops.implodeOf(this.all(), glueOrFormatter, undefined, keyOrSeparator)
  }

  join(glue: string, finalGlue?: string): string {
    return ops.joinOf(this.all(), glue, finalGlue)
  }

  // ─── Conditionals ───────────────────────────────────────────────────────────
  when(
    condition: boolean | ((c: this) => boolean),
    callback: (c: this, value: boolean) => this | void,
    fallback?: (c: this, value: boolean) => this | void
  ): this {
    return ops.whenOf(this, condition, callback, fallback) as this
  }
  unless(
    condition: boolean | ((c: this) => boolean),
    callback: (c: this, value: boolean) => this | void,
    fallback?: (c: this, value: boolean) => this | void
  ): this {
    const inverted =
      typeof condition === 'function'
        ? (c: this) => !(condition as (c: this) => boolean)(c)
        : !condition
    return ops.whenOf(this, inverted, callback, fallback) as this
  }
  whenEmpty(cb: (c: this) => this | void, fb?: (c: this) => this | void): this {
    return this.when(this.isEmpty(), cb, fb)
  }
  whenNotEmpty(cb: (c: this) => this | void, fb?: (c: this) => this | void): this {
    return this.when(this.isNotEmpty(), cb, fb)
  }
  unlessEmpty(cb: (c: this) => this | void): this {
    return this.whenNotEmpty(cb)
  }
  unlessNotEmpty(cb: (c: this) => this | void): this {
    return this.whenEmpty(cb)
  }

  // ─── Lazy-only ──────────────────────────────────────────────────────────────
  /**
   * Stop enumerating once `deadline` is reached. `deadline` may be a Date or
   * an absolute epoch-millis number.
   */
  takeUntilTimeout(deadline: Date | number): LazyCollection<T> {
    const target = deadline instanceof Date ? deadline.getTime() : deadline
    const src = this.source
    return new LazyCollection<T>(function* () {
      for (const item of src()) {
        if (Date.now() >= target) return
        yield item
      }
    })
  }

  /**
   * Async throttle — yields one value every `seconds` seconds. Only useful in
   * an `for await` context: returns an async iterable rather than a sync one.
   */
  throttle(seconds: number): AsyncIterable<T> {
    const src = this.source
    const ms = Math.max(0, seconds * 1000)
    return {
      [Symbol.asyncIterator](): AsyncIterator<T> {
        const it = src()[Symbol.iterator]()
        let first = true
        return {
          async next(): Promise<IteratorResult<T>> {
            if (!first) await new Promise<void>((r) => setTimeout(r, ms))
            first = false
            return it.next()
          }
        }
      }
    }
  }

  /**
   * Memoize values that have already been pulled. Subsequent iterations replay
   * them from cache rather than re-running the source generator.
   */
  remember(): LazyCollection<T> {
    const cache: T[] = []
    const sourceIter = this.source()[Symbol.iterator]()
    let exhausted = false
    return new LazyCollection<T>(function* () {
      let i = 0
      while (true) {
        if (i < cache.length) {
          yield cache[i]
          i++
          continue
        }
        if (exhausted) return
        const next = sourceIter.next()
        if (next.done) {
          exhausted = true
          return
        }
        cache.push(next.value)
        yield next.value
        i++
      }
    })
  }

  /**
   * Invoke `callback` every `interval` (a Date or epoch-ms duration) while
   * enumerating. Useful for extending locks / posting heartbeats.
   */
  withHeartbeat(intervalMs: number, callback: () => void): LazyCollection<T> {
    const src = this.source
    return new LazyCollection<T>(function* () {
      let lastTick = Date.now()
      for (const item of src()) {
        const now = Date.now()
        if (now - lastTick >= intervalMs) {
          callback()
          lastTick = now
        }
        yield item
      }
    })
  }

  // ─── Macroable ──────────────────────────────────────────────────────────────
  static macro: MacroableTarget['macro'] = () => {
    throw new Error('LazyCollection.macro is not yet wired — internal initialisation error.')
  }
  static hasMacro: MacroableTarget['hasMacro'] = () => false
  static flushMacros: MacroableTarget['flushMacros'] = () => undefined

  // ─── Helpers ────────────────────────────────────────────────────────────────
  private materialise<U>(other: readonly U[] | LazyCollection<U> | Collection<U>): U[] {
    if (other instanceof LazyCollection) return other.all()
    if (other instanceof Collection) return other.toArray()
    return [...(other as readonly U[])]
  }
}

applyMacroable(LazyCollection)

// Wire the back-reference so Collection.lazy() can construct us.
setLazyConstructor(
  LazyCollection as unknown as new <U>(items: Iterable<U>) => { all(): U[] } & Iterable<U>
)
