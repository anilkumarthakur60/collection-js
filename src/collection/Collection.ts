import type { Enumerable } from '../contracts/Enumerable'
import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'
import { UnexpectedValueException } from '../exceptions/UnexpectedValueException'
import { applyMacroable, type MacroableTarget } from '../macros/Macroable'
import * as ops from '../operations'
import { deepClone } from '../support/deepClone'
import { isPlainObject } from '../support/isObject'
import { arrayWrap, ensureArray, toArray } from '../support/arrayWrap'
import { valueRetriever } from '../support/valueRetriever'
import type {
  ClassConstructor,
  Comparator,
  Operator,
  Predicate,
  SortDirection,
} from '../support/types'
import type { RetrieverInput } from '../support/valueRetriever'
import { dataGet } from '../support/dataGet'

type RI<T, R = unknown> = RetrieverInput<T, R>

/**
 * Build a callable proxy: invoking it with arguments runs `impl(...args)`;
 * accessing a property returns `impl((item) => dataGet(item, key))`.
 *
 * This implements Laravel's higher-order messaging for aggregations:
 *   coll.sum('votes')  // string key
 *   coll.sum(it => it.votes)  // callback
 *   coll.sum.votes  // property access
 */
function callableHigherOrder<R>(
  impl: (by?: ((item: unknown, idx: number) => R) | string) => R,
): unknown {
  const fn = function (this: unknown, by?: unknown): R {
    if (typeof by === 'function') return impl(by as (item: unknown, idx: number) => R)
    if (typeof by === 'string') return impl(by)
    return impl()
  }
  return new Proxy(fn, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol') return (fn as unknown as Record<symbol, unknown>)[prop]
      return impl((item: unknown) => dataGet(item, prop) as R)
    },
    apply(_target, _thisArg, args: unknown[]) {
      const a = args[0]
      if (typeof a === 'function') return impl(a as (item: unknown, idx: number) => R)
      if (typeof a === 'string') return impl(a)
      return impl()
    },
  })
}

/**
 * Eager Laravel-style collection. Holds an in-memory `T[]` and exposes
 * a fluent, chainable API. All methods that return a new collection are
 * non-mutating; mutating methods (`push`, `pop`, `shift`, `forget`, `pull`,
 * `splice`, `transform`, `put`) update `this.items` in place to match Laravel.
 */
export class Collection<T> implements Enumerable<T> {
  protected items: T[]

  constructor(items: Iterable<T> | ArrayLike<T> | null | undefined = []) {
    this.items = items == null ? [] : ensureArray(toArray(items as Iterable<T>))
  }

  // ─── Iteration protocol ──────────────────────────────────────────────────────
  [Symbol.iterator](): IterableIterator<T> {
    return this.items[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): string {
    return 'Collection'
  }

  get length(): number {
    return this.items.length
  }

  // ─── Static factories ───────────────────────────────────────────────────────
  static make<T>(items: Iterable<T> | ArrayLike<T> = []): Collection<T> {
    return new Collection<T>(items)
  }

  static fromJson<T>(json: string): Collection<T> {
    const parsed = JSON.parse(json) as T | T[]
    return new Collection<T>(arrayWrap(parsed) as T[])
  }

  static times<T>(count: number, factory: (n: number) => T): Collection<T> {
    return new Collection(ops.timesOf(count, factory))
  }

  static range(start: number, end: number, step: number = 1): Collection<number> {
    return new Collection(ops.rangeOf(start, end, step))
  }

  static wrap<T>(value: T | T[] | Collection<T> | null | undefined): Collection<T> {
    if (value instanceof Collection) return new Collection(value.toArray())
    return new Collection<T>(arrayWrap(value as T | T[] | null | undefined))
  }

  static unwrap<T>(value: T | T[] | Collection<T>): T | T[] {
    if (value instanceof Collection) return value.toArray()
    return value
  }

  static empty<T>(): Collection<T> {
    return new Collection<T>([])
  }

  static fromEntries<V>(entries: Iterable<readonly [string, V]>): Collection<Record<string, V>> {
    return new Collection([Object.fromEntries(entries)])
  }

  static fromMap<K, V>(map: Map<K, V>): Collection<[K, V]> {
    return new Collection([...map.entries()])
  }

  static fromSet<T>(set: Set<T>): Collection<T> {
    return new Collection([...set])
  }

  // ─── Higher-order proxies for aggregations ─────────────────────────────────
  // Each is BOTH a callable (`coll.sum(by)`) AND a property accessor
  // (`coll.sum.votes`). The exact signature is hard to model in TS so we type
  // them as the callable form for autocompletion; the property form works at
  // runtime and is documented separately.
  get sum(): (by?: RI<T, number> | string) => number {
    const items = this.items
    return callableHigherOrder<number>((by) => ops.sumOf(items, by as RI<T, number>)) as (
      by?: RI<T, number> | string,
    ) => number
  }
  get average(): (by?: RI<T, number> | string) => number {
    const items = this.items
    return callableHigherOrder<number>((by) => ops.averageOf(items, by as RI<T, number>)) as (
      by?: RI<T, number> | string,
    ) => number
  }
  get avg(): (by?: RI<T, number> | string) => number { return this.average }
  get max(): (by?: RI<T, number> | string) => number | undefined {
    const items = this.items
    return callableHigherOrder<number | undefined>((by) => ops.maxOf(items, by as RI<T, number>)) as (
      by?: RI<T, number> | string,
    ) => number | undefined
  }
  get min(): (by?: RI<T, number> | string) => number | undefined {
    const items = this.items
    return callableHigherOrder<number | undefined>((by) => ops.minOf(items, by as RI<T, number>)) as (
      by?: RI<T, number> | string,
    ) => number | undefined
  }

  // ─── Retrieval & access ──────────────────────────────────────────────────────
  all(): T[] {
    return this.items
  }

  first(predicate?: Predicate<T>): T | undefined {
    return ops.firstOf(this.items, predicate)
  }

  firstOrFail(predicate?: Predicate<T>): T {
    return ops.firstOrFailOf(this.items, predicate)
  }

  firstWhere(key: string, _operatorOrValue?: unknown, _value?: unknown): T | undefined {
    const argCount = arguments.length
    const spec = ops.buildFirstWhereSpec(arguments[1], arguments[2], argCount)
    return ops.firstWhereOf(this.items, key, spec)
  }

  last(predicate?: Predicate<T>): T | undefined {
    return ops.lastOf(this.items, predicate)
  }

  get(index: number, defaultValue?: T | (() => T)): T | undefined {
    const found = ops.getAt(this.items, index)
    if (found !== undefined) return found
    if (defaultValue === undefined) return undefined
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
  }

  value<R = unknown>(key: string): R | undefined {
    return ops.valueOfFirst<T, R>(this.items, key)
  }

  sole(predicate?: Predicate<T> | string, expected?: unknown): T {
    return ops.soleOf(this.items, predicate, expected)
  }

  after(target: T | string | Predicate<T>, strict = false): T | undefined {
    return ops.afterOf(this.items, target, strict)
  }

  before(target: T | string | Predicate<T>, strict = false): T | undefined {
    return ops.beforeOf(this.items, target, strict)
  }

  random(): T | undefined
  random(count: number | ((c: this) => number)): Collection<T>
  random(count?: number | ((c: this) => number)): T | Collection<T> | undefined {
    if (count === undefined) return ops.randomOne(this.items)
    const n = typeof count === 'function' ? count(this) : count
    return new Collection(ops.randomMany(this.items, n))
  }

  // ─── Search & inspection ─────────────────────────────────────────────────────
  contains(target: unknown, value?: unknown): boolean {
    const spec = ops.resolveContainsSpec<T>(target as ops.ContainsArg<T>, value, arguments.length >= 2)
    return ops.containsOf(this.items, spec, false)
  }

  containsStrict(target: unknown, value?: unknown): boolean {
    const spec = ops.resolveContainsSpec<T>(target as ops.ContainsArg<T>, value, arguments.length >= 2)
    return ops.containsOf(this.items, spec, true)
  }

  doesntContain(target: unknown, value?: unknown): boolean {
    return !this.contains(target as ops.ContainsArg<T>, value)
  }

  doesntContainStrict(target: unknown, value?: unknown): boolean {
    return !this.containsStrict(target as ops.ContainsArg<T>, value)
  }

  containsOneItem(predicate?: Predicate<T>): boolean {
    return this.hasSole(predicate)
  }

  every(predicate: Predicate<T>): boolean {
    return ops.everyOf(this.items, predicate)
  }

  some(predicate: Predicate<T>): boolean {
    return ops.someOf(this.items, predicate)
  }

  search(target: T | Predicate<T>, strict = false): number | false {
    return ops.searchOf(this.items, target, strict)
  }

  has(key: string | readonly string[]): boolean {
    return ops.hasKey(this.items, Array.isArray(key) ? (key as readonly string[]) : [key as string])
  }

  hasAny(keys: readonly string[]): boolean {
    return ops.hasAnyKey(this.items, keys)
  }

  hasMany(predicate?: Predicate<T>): boolean {
    if (predicate) return this.items.filter((item, i) => predicate(item, i)).length > 1
    return this.items.length > 1
  }

  hasSole(predicate?: Predicate<T>): boolean {
    if (predicate) return this.items.filter((item, i) => predicate(item, i)).length === 1
    return this.items.length === 1
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isNotEmpty(): boolean {
    return this.items.length > 0
  }

  count(): number {
    return this.items.length
  }

  countBy(by?: RI<T>): Record<string, number> {
    const map = ops.countByOf(this.items, by)
    const out: Record<string, number> = {}
    for (const [k, v] of map) out[String(k)] = v
    return out
  }

  // ─── Filtering ───────────────────────────────────────────────────────────────
  filter<S extends T>(predicate: (item: T, index: number) => item is S): Collection<S>
  filter(predicate?: (item: T, index: number) => unknown): Collection<T>
  filter(predicate?: (item: T, index: number) => unknown): unknown {
    return new Collection(ops.filterOf(this.items, predicate as Predicate<T> | undefined))
  }

  reject<S extends T>(predicate: (item: T, index: number) => item is S): Collection<Exclude<T, S>>
  reject(predicate: (item: T, index: number) => unknown): Collection<T>
  reject(predicate: (item: T, index: number) => unknown): unknown {
    return new Collection(ops.rejectOf(this.items, predicate as Predicate<T>))
  }

  where(key: string, _operatorOrValue?: unknown, _value?: unknown): Collection<T> {
    const args = Array.from(arguments)
    const spec = ops.buildWhereSpec(args, false)
    return new Collection(ops.whereOf(this.items, key, spec))
  }

  whereStrict(key: string, value: unknown): Collection<T> {
    const spec = ops.buildWhereSpec([key, value], true)
    return new Collection(ops.whereOf(this.items, key, spec))
  }

  whereIn(key: string, values: readonly unknown[]): Collection<T> {
    return new Collection(ops.whereInOf(this.items, key, values, false))
  }

  whereInStrict(key: string, values: readonly unknown[]): Collection<T> {
    return new Collection(ops.whereInOf(this.items, key, values, true))
  }

  whereNotIn(key: string, values: readonly unknown[]): Collection<T> {
    return new Collection(ops.whereNotInOf(this.items, key, values, false))
  }

  whereNotInStrict(key: string, values: readonly unknown[]): Collection<T> {
    return new Collection(ops.whereNotInOf(this.items, key, values, true))
  }

  whereBetween(key: string, range: readonly [unknown, unknown]): Collection<T> {
    return new Collection(ops.whereBetweenOf(this.items, key, range))
  }

  whereNotBetween(key: string, range: readonly [unknown, unknown]): Collection<T> {
    return new Collection(ops.whereNotBetweenOf(this.items, key, range))
  }

  whereNull(key: string): Collection<T> {
    return new Collection(ops.whereNullOf(this.items, key))
  }

  whereNotNull(key: string): Collection<T> {
    return new Collection(ops.whereNotNullOf(this.items, key))
  }

  /** Strip `null`/`undefined` from the collection and narrow the element type. */
  compact(): Collection<NonNullable<T>> {
    return new Collection(this.items.filter((item): item is NonNullable<T> => item != null))
  }

  whereInstanceOf<R>(Ctor: ClassConstructor<R> | (abstract new (...args: never[]) => R)): Collection<R> {
    return new Collection(ops.whereInstanceOfOf<T, R>(this.items, Ctor as ClassConstructor<R>))
  }

  // ─── Transformation ──────────────────────────────────────────────────────────
  map<R>(fn: (item: T, index: number) => R): Collection<R> {
    return new Collection(ops.mapOf(this.items, fn))
  }

  mapInto<R>(Ctor: ClassConstructor<R, [T]>): Collection<R> {
    return new Collection(ops.mapIntoOf(this.items, Ctor))
  }

  mapSpread<R>(fn: (...args: T extends readonly unknown[] ? T : never) => R): Collection<R> {
    return new Collection(
      ops.mapSpreadOf(this.items as unknown as readonly (readonly unknown[])[], fn as (...args: unknown[]) => R) as R[],
    )
  }

  mapToGroups<K extends PropertyKey, V>(fn: (item: T, index: number) => readonly [K, V]): Record<K, V[]> {
    return ops.mapToGroupsOf(this.items, fn)
  }

  mapWithKeys<K extends PropertyKey, V>(fn: (item: T, index: number) => readonly [K, V]): Record<K, V> {
    return ops.mapWithKeysOf(this.items, fn)
  }

  flatMap<R>(fn: (item: T, index: number) => R | readonly R[]): Collection<R> {
    return new Collection(ops.flatMapOf(this.items, fn))
  }

  flatten(depth: number = Infinity): Collection<unknown> {
    return new Collection(ops.flattenOf(this.items as readonly unknown[], depth))
  }

  collapse<U>(this: Collection<readonly U[] | U>): Collection<U> {
    return new Collection(ops.collapseOf(this.items as unknown as readonly (readonly U[] | U)[]))
  }

  collapseWithKeys(): Collection<Record<string, unknown>> {
    if (this.items.length === 0) return new Collection<Record<string, unknown>>([])
    const merged: Record<string, unknown> = {}
    for (const item of this.items) {
      if (item == null || typeof item !== 'object') continue
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        merged[k] = v instanceof Collection ? v.toArray() : v
      }
    }
    return new Collection([merged])
  }

  flip(): Collection<Record<string, number>> {
    return new Collection([ops.flipOf(this.items as readonly unknown[])])
  }

  pluck(key: string): Collection<unknown>
  pluck(key: string, keyBy: string): Record<string, unknown>
  pluck(key: string, keyBy?: string): Collection<unknown> | Record<string, unknown> {
    const result = ops.pluckOf(this.items, key, keyBy)
    return Array.isArray(result) ? new Collection(result) : result
  }

  /** In-place variant of `map`. */
  transform(fn: (item: T, index: number) => T): this {
    this.items = ops.mapOf(this.items, fn)
    return this
  }

  replace(replacements: Record<number, T>): Collection<T> {
    return new Collection(ops.replaceShallow(this.items, replacements))
  }

  replaceRecursive(patches: readonly unknown[]): Collection<T> {
    return new Collection(ops.replaceRecursiveOf(this.items, patches))
  }

  // ─── Sorting ────────────────────────────────────────────────────────────────
  sort(comparator?: Comparator<T>): Collection<T> {
    return new Collection(ops.sortOf(this.items, comparator))
  }

  sortDesc(): Collection<T> {
    return new Collection(ops.sortDescOf(this.items))
  }

  sortBy(spec: ops.SortBySpec<T> | readonly ops.SortBySpec<T>[]): Collection<T> {
    return new Collection(ops.sortByOf(this.items, spec))
  }

  sortByDesc(spec: ops.SortBySpec<T>): Collection<T> {
    return new Collection(ops.sortByDescOf(this.items, spec))
  }

  sortKeys(): Collection<T> {
    return new Collection(ops.sortKeysOf(this.items as unknown as readonly object[]) as unknown as T[])
  }

  sortKeysDesc(): Collection<T> {
    return new Collection(ops.sortKeysOf(this.items as unknown as readonly object[], true) as unknown as T[])
  }

  sortKeysUsing(comparator: (a: string, b: string) => number): Collection<T> {
    return new Collection(
      ops.sortKeysUsingOf(this.items as unknown as readonly object[], comparator) as unknown as T[],
    )
  }

  reverse(): Collection<T> {
    return new Collection(ops.reverseOf(this.items))
  }

  shuffle(random?: () => number): Collection<T> {
    return new Collection(ops.shuffleOf(this.items, random))
  }

  // ─── Aggregation aliases on the instance ─────────────────────────────────────
  sumBy(by?: RI<T, number>): number { return ops.sumOf(this.items, by) }
  averageBy(by?: RI<T, number>): number { return ops.averageOf(this.items, by) }
  avgBy(by?: RI<T, number>): number { return ops.averageOf(this.items, by) }
  maxBy(by?: RI<T, number>): number | undefined { return ops.maxOf(this.items, by) }
  minBy(by?: RI<T, number>): number | undefined { return ops.minOf(this.items, by) }
  median(by?: RI<T, number>): number | undefined { return ops.medianOf(this.items, by) }
  mode(by?: RI<T>): unknown[] | undefined { return ops.modeOf(this.items, by) }
  percentage(predicate: Predicate<T>, precision: number = 2): number {
    return ops.percentageOf(this.items, predicate, precision)
  }

  // ─── Chunking & partitioning ─────────────────────────────────────────────────
  chunk(size: number): Collection<Collection<T>> {
    return new Collection(ops.chunkOf(this.items, size).map((c) => new Collection(c)))
  }

  chunkWhile(predicate: (item: T, key: number, chunk: readonly T[]) => boolean): Collection<Collection<T>> {
    return new Collection(ops.chunkWhileOf(this.items, predicate).map((c) => new Collection(c)))
  }

  sliding(size: number, step: number = 1): Collection<Collection<T>> {
    return new Collection(ops.slidingOf(this.items, size, step).map((c) => new Collection(c)))
  }

  split(groups: number): Collection<Collection<T>> {
    return new Collection(ops.splitOf(this.items, groups).map((c) => new Collection(c)))
  }

  splitIn(groups: number): Collection<Collection<T>> {
    return new Collection(ops.splitInOf(this.items, groups).map((c) => new Collection(c)))
  }

  partition<S extends T>(
    predicate: (item: T, index: number) => item is S,
  ): [Collection<S>, Collection<Exclude<T, S>>]
  partition(predicate: (item: T, index: number) => unknown): [Collection<T>, Collection<T>]
  partition(predicate: (item: T, index: number) => unknown): unknown {
    const [a, b] = ops.partitionOf(this.items, predicate as Predicate<T>)
    return [new Collection(a), new Collection(b)]
  }

  forPage(page: number, perPage: number): Collection<T> {
    return new Collection(ops.forPageOf(this.items, page, perPage))
  }

  nth(step: number, offset: number = 0): Collection<T> {
    return new Collection(ops.nthOf(this.items, step, offset))
  }

  groupBy(by: RI<T, PropertyKey | readonly PropertyKey[]>): Record<PropertyKey, T[]> {
    return ops.groupByOf<T, PropertyKey>(this.items, by)
  }

  groupByMany(groupers: readonly RI<T>[]): Record<PropertyKey, unknown> {
    return ops.groupByManyOf(this.items, groupers)
  }

  keyBy(by: RI<T, PropertyKey>): Record<PropertyKey, T> {
    return ops.keyByOf<T, PropertyKey>(this.items, by)
  }

  // ─── Slice / take / skip ────────────────────────────────────────────────────
  take(count: number): Collection<T> { return new Collection(ops.takeOf(this.items, count)) }
  takeUntil(target: T | Predicate<T>): Collection<T> { return new Collection(ops.takeUntilOf(this.items, target)) }
  takeWhile(predicate: Predicate<T>): Collection<T> { return new Collection(ops.takeWhileOf(this.items, predicate)) }
  skip(count: number): Collection<T> { return new Collection(ops.skipOf(this.items, count)) }
  skipUntil(target: T | Predicate<T>): Collection<T> { return new Collection(ops.skipUntilOf(this.items, target)) }
  skipWhile(predicate: Predicate<T>): Collection<T> { return new Collection(ops.skipWhileOf(this.items, predicate)) }
  slice(start: number, length?: number): Collection<T> { return new Collection(ops.sliceOf(this.items, start, length)) }

  // ─── Mutations ──────────────────────────────────────────────────────────────
  push(...values: T[]): this {
    this.items.push(...values)
    return this
  }

  prepend(value: T): this {
    this.items.unshift(value)
    return this
  }

  pop(): T | undefined
  pop(count: number): Collection<T>
  pop(count?: number): T | undefined | Collection<T> {
    if (count === undefined) return this.items.pop()
    const { remaining, removed } = ops.popOf(this.items, count)
    this.items = remaining
    return new Collection(removed)
  }

  shift(): T | undefined
  shift(count: number): Collection<T>
  shift(count?: number): T | undefined | Collection<T> {
    if (count === undefined) return this.items.shift()
    const { remaining, removed } = ops.shiftOf(this.items, count)
    this.items = remaining
    return new Collection(removed)
  }

  pull(target: T): T | undefined {
    const { remaining, removed } = ops.pullOf(this.items, target)
    this.items = remaining
    return removed
  }

  forget(keys: number | string | readonly (number | string)[]): this {
    const list = Array.isArray(keys) ? (keys as readonly (number | string)[]) : [keys as number | string]
    this.items = ops.forgetOf(this.items, list)
    return this
  }

  splice(start: number, deleteCount?: number, ...replacements: T[]): Collection<T> {
    const { remaining, removed } = ops.spliceOf(this.items, start, deleteCount, replacements)
    this.items = remaining
    return new Collection(removed)
  }

  put<K extends keyof T & string>(key: K, value: T[K]): Collection<T> {
    const items = this.items as unknown as Array<Record<string, unknown>>
    const next = ops.putOf<Record<string, unknown>, string>(items, key, value as unknown)
    return new Collection(next as unknown as T[])
  }

  concat<U>(other: readonly U[] | Collection<U>): Collection<T | U> {
    const list = other instanceof Collection ? other.toArray() : other
    return new Collection<T | U>(ops.concatOf(this.items, list))
  }

  merge<U>(...sources: readonly (readonly U[] | Collection<U>)[]): Collection<T | U> {
    let acc: (T | U)[] = [...this.items] as (T | U)[]
    for (const src of sources) {
      const list = src instanceof Collection ? src.toArray() : src
      acc = ops.mergeOf(acc as readonly T[], list)
    }
    return new Collection<T | U>(acc)
  }

  mergeRecursive(...sources: readonly (readonly T[] | Collection<T>)[]): Collection<T> {
    const lists = sources.map((s) => (s instanceof Collection ? s.toArray() : (s as readonly T[])))
    return new Collection(ops.mergeRecursiveOf(this.items, ...lists))
  }

  union(other: readonly T[] | Collection<T>): Collection<T> {
    const list = other instanceof Collection ? other.toArray() : other
    if (this.items.every(isPlainObject)) {
      return new Collection(ops.unionObjectsOf(this.items as unknown as readonly object[], list as readonly object[]) as unknown as T[])
    }
    return new Collection(ops.unionOf(this.items, list))
  }

  // ─── Set operations ──────────────────────────────────────────────────────────
  diff(other: readonly T[] | Collection<T>): Collection<T> {
    return new Collection(ops.diffOf(this.items, other instanceof Collection ? other.toArray() : other))
  }

  diffAssoc(other: readonly Partial<T>[] | Collection<Partial<T>>): Collection<T> {
    return new Collection(ops.diffAssocOf(this.items, other instanceof Collection ? other.toArray() : other))
  }

  diffAssocUsing(other: readonly T[] | Collection<T>, comparator: (a: T, b: T) => number): Collection<T> {
    return new Collection(
      ops.diffAssocUsingOf(this.items, other instanceof Collection ? other.toArray() : other, comparator),
    )
  }

  diffKeys(otherKeys: readonly string[]): Collection<T> {
    return new Collection(ops.diffKeysOf(this.items as unknown as readonly object[], otherKeys) as unknown as T[])
  }

  intersect(other: readonly T[] | Collection<T>): Collection<T> {
    return new Collection(ops.intersectOf(this.items, other instanceof Collection ? other.toArray() : other))
  }

  intersectUsing(other: readonly T[] | Collection<T>, comparator: (a: T, b: T) => number): Collection<T> {
    return new Collection(
      ops.intersectUsingOf(this.items, other instanceof Collection ? other.toArray() : other, comparator),
    )
  }

  intersectAssoc(other: readonly Partial<T>[] | Collection<Partial<T>>): Collection<T> {
    return new Collection(
      ops.intersectAssocOf(
        this.items as unknown as readonly object[],
        (other instanceof Collection ? other.toArray() : other) as readonly Partial<object>[],
      ) as unknown as T[],
    )
  }

  intersectAssocUsing(
    other: Record<string, unknown>,
    comparator: (a: string, b: string) => number,
  ): Collection<T> {
    return new Collection(
      ops.intersectAssocUsingOf(this.items as unknown as readonly object[], other, comparator) as unknown as T[],
    )
  }

  intersectByKeys(keys: readonly string[]): Collection<T> {
    return new Collection(ops.intersectByKeysOf(this.items as unknown as readonly object[], keys) as unknown as T[])
  }

  crossJoin<U>(...others: readonly (readonly U[])[]): Collection<(T | U)[]> {
    const sources: readonly (T | U)[][] = [
      this.items.slice() as (T | U)[],
      ...others.map((o) => [...o] as (T | U)[]),
    ]
    return new Collection<(T | U)[]>(ops.crossJoinOf<T | U>(...sources))
  }

  // ─── Unique & duplicates ─────────────────────────────────────────────────────
  unique(by?: RI<T>): Collection<T> { return new Collection(ops.uniqueOf(this.items, by, false)) }
  uniqueStrict(by?: RI<T>): Collection<T> { return new Collection(ops.uniqueStrictOf(this.items, by)) }

  duplicates(by?: RI<T>): Record<number, T> {
    const accessor = by !== undefined ? valueRetriever<T, unknown>(by) : undefined
    const map = ops.duplicatesOf(this.items, accessor ? (item) => accessor(item, 0) : undefined, false)
    const out: Record<number, T> = {}
    for (const [idx, item] of map) out[idx] = item
    return out
  }

  duplicatesStrict(by?: RI<T>): Record<number, T> {
    const accessor = by !== undefined ? valueRetriever<T, unknown>(by) : undefined
    const map = ops.duplicatesOf(this.items, accessor ? (item) => accessor(item, 0) : undefined, true)
    const out: Record<number, T> = {}
    for (const [idx, item] of map) out[idx] = item
    return out
  }

  // ─── Object key operations ──────────────────────────────────────────────────
  keys(): Collection<string> { return new Collection(ops.keysOf(this.items)) }
  values(): Collection<T> { return new Collection([...this.items]) }

  only(keys: readonly string[]): Collection<Partial<T>> {
    return new Collection(ops.onlyOf(this.items as unknown as readonly object[], keys) as Partial<T>[])
  }
  except(keys: readonly string[]): Collection<Partial<T>> {
    return new Collection(ops.exceptOf(this.items as unknown as readonly object[], keys) as Partial<T>[])
  }
  select<K extends keyof T>(keys: K | readonly K[]): Collection<Pick<T, K>> {
    return new Collection(
      ops.selectOf<T extends object ? T : never, K>(
        this.items as unknown as readonly (T extends object ? T : never)[],
        keys,
      ) as unknown as Pick<T, K>[],
    )
  }

  dot(): Record<string, unknown> { return ops.dotOf(this.items as readonly unknown[]) }
  undot(): Collection<Record<string, unknown>> { return new Collection([ops.undotOf(this.items as readonly unknown[])]) }

  // ─── Iteration helpers ──────────────────────────────────────────────────────
  each(callback: (item: T, index: number) => void | false): this {
    for (let i = 0; i < this.items.length; i++) {
      if (callback(this.items[i], i) === false) break
    }
    return this
  }

  eachSpread(callback: (...args: T extends readonly unknown[] ? T : never) => void | false): this {
    for (let i = 0; i < this.items.length; i++) {
      if (callback(...(this.items[i] as unknown as T extends readonly unknown[] ? T : never)) === false) break
    }
    return this
  }

  tapEach(callback: (item: T, index: number) => void): this {
    this.items.forEach(callback)
    return this
  }

  // ─── Reduction & piping ─────────────────────────────────────────────────────
  reduce<R>(fn: (carry: R, item: T, index: number) => R, initial: R): R
  reduce(fn: (carry: T, item: T, index: number) => T): T
  reduce<R>(fn: (carry: R | T, item: T, index: number) => R | T, initial?: R): R | T {
    if (initial === undefined) {
      if (this.items.length === 0) throw new TypeError('Reduce of empty collection with no initial value')
      let acc: T = this.items[0]
      for (let i = 1; i < this.items.length; i++) acc = fn(acc as T, this.items[i], i) as T
      return acc
    }
    return ops.reduceOf(this.items, fn as (c: R, i: T, k: number) => R, initial)
  }

  reduceSpread<R extends readonly unknown[]>(
    fn: (carry: R, item: T, index: number) => R,
    ...initials: R
  ): R {
    return ops.reduceSpreadOf(this.items, fn, ...initials)
  }

  pipe<R>(callback: (collection: this) => R): R { return callback(this) }
  pipeInto<R>(Ctor: ClassConstructor<R, [this]>): R { return new Ctor(this) }
  pipeThrough(pipes: readonly ((value: unknown) => unknown)[]): unknown {
    return pipes.reduce<unknown>((carry, pipe) => pipe(carry), this)
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  // ─── String operations ──────────────────────────────────────────────────────
  implode(glueOrFormatter: string | ((item: T, index: number) => string), keyOrSeparator?: string): string {
    if (typeof glueOrFormatter === 'function') {
      return ops.implodeOf(this.items, glueOrFormatter, keyOrSeparator ?? '')
    }
    return ops.implodeOf(this.items, glueOrFormatter, undefined, keyOrSeparator)
  }

  join(glue: string, finalGlue?: string): string {
    return ops.joinOf(this.items, glue, finalGlue)
  }

  // ─── Conditionals ───────────────────────────────────────────────────────────
  when(
    condition: boolean | ((c: this) => boolean),
    callback: (c: this, value: boolean) => this | void,
    fallback?: (c: this, value: boolean) => this | void,
  ): this {
    return ops.whenOf(this, condition, callback, fallback) as this
  }

  unless(
    condition: boolean | ((c: this) => boolean),
    callback: (c: this, value: boolean) => this | void,
    fallback?: (c: this, value: boolean) => this | void,
  ): this {
    const inverted = typeof condition === 'function' ? (c: this) => !(condition as (c: this) => boolean)(c) : !condition
    return ops.whenOf(this, inverted, callback, fallback) as this
  }

  whenEmpty(callback: (c: this) => this | void, fallback?: (c: this) => this | void): this {
    return this.when(this.isEmpty(), callback, fallback)
  }

  whenNotEmpty(callback: (c: this) => this | void, fallback?: (c: this) => this | void): this {
    return this.when(this.isNotEmpty(), callback, fallback)
  }

  unlessEmpty(callback: (c: this) => this | void): this { return this.whenNotEmpty(callback) }
  unlessNotEmpty(callback: (c: this) => this | void): this { return this.whenEmpty(callback) }

  // ─── Type checking ──────────────────────────────────────────────────────────
  ensure(...types: ReadonlyArray<ClassConstructor<unknown> | string>): this {
    for (const item of this.items) {
      const ok = types.some((type) =>
        typeof type === 'string' ? typeof item === type || (type === 'array' && Array.isArray(item)) : item instanceof (type as Function),
      )
      if (!ok) {
        const expected = types.map((t) => (typeof t === 'string' ? t : (t as Function).name || 'object')).join('|')
        throw new UnexpectedValueException(
          `Collection should only include "${expected}" items, but ${typeof item} found.`,
        )
      }
    }
    return this
  }

  // ─── Padding & multiplication ───────────────────────────────────────────────
  pad(size: number, value: T): Collection<T> { return new Collection(ops.padOf(this.items, size, value)) }
  multiply(factor: number): Collection<T> { return new Collection(ops.multiplyOf(this.items, factor)) }
  repeat(factor: number): Collection<T> { return this.multiply(factor) }
  times(factor: number): Collection<T> { return this.multiply(factor) }

  // ─── Combine & zip ──────────────────────────────────────────────────────────
  combine<V>(values: readonly V[] | Collection<V>): Record<string, V> {
    const list = values instanceof Collection ? values.toArray() : values
    return ops.combineOf(this.items.map(String) as readonly string[], list)
  }

  zip<U>(values: readonly U[] | Collection<U>): Collection<[T, U | undefined]> {
    const list = values instanceof Collection ? values.toArray() : values
    return new Collection(ops.zipOf(this.items, list))
  }

  // ─── Wrap helpers ───────────────────────────────────────────────────────────
  wrap(): Collection<T[]> { return new Collection([this.items]) }
  unwrap(): T | T[] { return this.items.length === 1 ? this.items[0] : [...this.items] }

  // ─── Range helper instance ──────────────────────────────────────────────────
  range(start: number, end: number, step: number = 1): Collection<number> {
    return Collection.range(start, end, step)
  }

  // ─── Serialization ──────────────────────────────────────────────────────────
  toArray(): T[] { return [...this.items] }
  toJson(): string { return JSON.stringify(this.items) }
  toPrettyJson(indent: number = 2): string { return JSON.stringify(this.items, null, indent) }
  toMap<K, V>(keyFn: (item: T, i: number) => K, valueFn: (item: T, i: number) => V): Map<K, V> {
    const out = new Map<K, V>()
    for (let i = 0; i < this.items.length; i++) out.set(keyFn(this.items[i], i), valueFn(this.items[i], i))
    return out
  }
  toSet(): Set<T> { return new Set(this.items) }
  toJSON(): T[] { return this.items }
  toString(): string { return this.toJson() }
  valueOf(): T[] { return this.items }
  [Symbol.toPrimitive](hint: string): string | number | T[] {
    if (hint === 'number') return this.items.length
    if (hint === 'string') return this.toJson()
    return this.items
  }

  // ─── Cloning ────────────────────────────────────────────────────────────────
  collect(): Collection<T> { return new Collection([...this.items]) }
  clone(): Collection<T> { return new Collection(deepClone(this.items)) }
  /**
   * Returns a LazyCollection. Wired by `setLazyConstructor` at module load
   * time to avoid an ESM circular import between Collection ↔ LazyCollection.
   */
  lazy(): unknown {
    if (lazyConstructor === null) throw new Error('LazyCollection not registered yet — internal wiring error.')
    return new lazyConstructor(this.items)
  }

  // ─── Debug ──────────────────────────────────────────────────────────────────
  dump(): this {
    // eslint-disable-next-line no-console
    console.log(this.items)
    return this
  }
  dd(): never {
    this.dump()
    throw new ItemNotFoundException('Dump-and-die: Collection inspection terminated.')
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────
  variance(by?: RI<T, number>): number | undefined { return ops.varianceOf(this.items, by) }
  sampleVariance(by?: RI<T, number>): number | undefined { return ops.sampleVarianceOf(this.items, by) }
  stddev(by?: RI<T, number>): number | undefined { return ops.stddevOf(this.items, by) }
  sampleStddev(by?: RI<T, number>): number | undefined { return ops.sampleStddevOf(this.items, by) }
  quantile(q: number, by?: RI<T, number>): number | undefined { return ops.quantileOf(this.items, q, by) }
  percentileAt(p: number, by?: RI<T, number>): number | undefined { return ops.percentileOf(this.items, p, by) }
  histogram(bins: number, options?: { by?: RI<T, number>; range?: readonly [number, number] }): ops.HistogramBin[] {
    return ops.histogramOf(this.items, bins, options)
  }
  correlation(xBy: RI<T, number>, yBy: RI<T, number>): number | undefined {
    return ops.correlationOf(this.items, xBy, yBy)
  }

  // ─── SQL-style joins ────────────────────────────────────────────────────────
  joinOn<R, K extends PropertyKey>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
  ): Collection<[T, R]>
  joinOn<R, K extends PropertyKey, M>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge: (l: T, r: R) => M,
  ): Collection<M>
  joinOn<R, K extends PropertyKey, M = [T, R]>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge?: (l: T, r: R) => M,
  ): Collection<M> {
    const list = right instanceof Collection ? right.toArray() : right
    return new Collection(ops.joinOnOf<T, R, K, M>(this.items, list, leftKey, rightKey, merge))
  }

  leftJoin<R, K extends PropertyKey>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
  ): Collection<[T, R | undefined]>
  leftJoin<R, K extends PropertyKey, M>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge: (l: T, r: R | undefined) => M,
  ): Collection<M>
  leftJoin<R, K extends PropertyKey, M = [T, R | undefined]>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge?: (l: T, r: R | undefined) => M,
  ): Collection<M> {
    const list = right instanceof Collection ? right.toArray() : right
    return new Collection(ops.leftJoinOf<T, R, K, M>(this.items, list, leftKey, rightKey, merge))
  }

  rightJoin<R, K extends PropertyKey>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
  ): Collection<[T | undefined, R]>
  rightJoin<R, K extends PropertyKey, M>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge: (l: T | undefined, r: R) => M,
  ): Collection<M>
  rightJoin<R, K extends PropertyKey, M = [T | undefined, R]>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge?: (l: T | undefined, r: R) => M,
  ): Collection<M> {
    const list = right instanceof Collection ? right.toArray() : right
    return new Collection(ops.rightJoinOf<T, R, K, M>(this.items, list, leftKey, rightKey, merge))
  }

  outerJoin<R, K extends PropertyKey>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
  ): Collection<[T | undefined, R | undefined]>
  outerJoin<R, K extends PropertyKey, M>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge: (l: T | undefined, r: R | undefined) => M,
  ): Collection<M>
  outerJoin<R, K extends PropertyKey, M = [T | undefined, R | undefined]>(
    right: readonly R[] | Collection<R>,
    leftKey: RI<T, K>,
    rightKey: RI<R, K>,
    merge?: (l: T | undefined, r: R | undefined) => M,
  ): Collection<M> {
    const list = right instanceof Collection ? right.toArray() : right
    return new Collection(ops.outerJoinOf<T, R, K, M>(this.items, list, leftKey, rightKey, merge))
  }

  // ─── itertools-style ────────────────────────────────────────────────────────
  scan<R>(fn: (carry: R, item: T, index: number) => R, initial: R): Collection<R> {
    return new Collection(ops.scanOf(this.items, fn, initial))
  }
  pairwise(): Collection<[T, T]> { return new Collection(ops.pairwiseOf(this.items)) }
  enumerate(start: number = 0): Collection<[number, T]> { return new Collection(ops.enumerateOf(this.items, start)) }
  cycle(n: number = Infinity): Collection<T> {
    if (n === Infinity) {
      throw new Error('cycle(Infinity) on Collection materialises — use lazy().cycle() for infinite cycles')
    }
    return new Collection([...ops.cycleOf(this.items, n)])
  }
  interleave(...others: readonly (readonly T[] | Collection<T>)[]): Collection<T> {
    const sources: readonly T[][] = [
      this.items.slice(),
      ...others.map((o) => (o instanceof Collection ? o.toArray() : [...o])),
    ]
    return new Collection(ops.interleaveOf(...sources))
  }
  permutations(r?: number): Collection<T[]> { return new Collection([...ops.permutationsOf(this.items, r)]) }
  combinations(r: number): Collection<T[]> { return new Collection([...ops.combinationsOf(this.items, r)]) }
  powerSet(): Collection<T[]> { return new Collection([...ops.powerSetOf(this.items)]) }

  // ─── Macroable surface ──────────────────────────────────────────────────────
  // Real implementations are installed by `applyMacroable(Collection)` below.
  // We declare placeholders so TS sees the right signatures.
  static macro: MacroableTarget['macro'] = () => {
    throw new Error('Collection.macro is not yet wired — internal initialisation error.')
  }
  static hasMacro: MacroableTarget['hasMacro'] = () => false
  static flushMacros: MacroableTarget['flushMacros'] = () => undefined
}

applyMacroable(Collection)

// Wired by LazyCollection module to break the ESM cycle.
type LazyCtor = new <U>(items: Iterable<U>) => { all(): U[] } & Iterable<U>
let lazyConstructor: LazyCtor | null = null
export function setLazyConstructor(ctor: LazyCtor): void {
  lazyConstructor = ctor
}

export type { Operator, SortDirection, Predicate, RetrieverInput }
