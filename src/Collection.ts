import { isDeepEqual, deepClone, mergeArrays, isObject, getNestedValue } from './internals'
import { flattenHelper } from './internals'
import { UnexpectedValueException } from './exceptions'
import { LazyCollection } from './LazyCollection'
import type { FlattenType, PlainObject } from './types'
import type { Predicate, PredicateChunkWhile, PredicateContains, Iteratee } from './types'
import type { IReadonlyCollection } from './types'

// Import extracted method implementations
import { all } from './methods/all'
import { after } from './methods/after'
import { average as averageFn } from './methods/average'
import { before } from './methods/before'
import { chunk as chunkFn } from './methods/chunk'
import {
  contains as containsFn,
  containsBy as containsByFn,
  containsByStrict as containsByStrictFn
} from './methods/contains'
import { countBy as countByFn } from './methods/countBy'
import { crossJoin as crossJoinFn } from './methods/crossJoin'
import {
  diff as diffFn,
  diffAssoc as diffAssocFn,
  diffAssocUsing as diffAssocUsingFn,
  diffKeys as diffKeysFn
} from './methods/diff'
import { dot as dotFn } from './methods/dot'
import {
  duplicates as duplicatesFn,
  duplicatesStrict as duplicatesStrictFn
} from './methods/duplicates'
import { each as eachFn, eachSpread as eachSpreadFn } from './methods/each'
import { filter as filterFn } from './methods/filter'
import {
  first as firstFn,
  firstOrFail as firstOrFailFn,
  firstWhere as firstWhereFn
} from './methods/first'
import { flip as flipFn } from './methods/flip'
import { forget as forgetFn } from './methods/forget'
import { groupBy as groupByFn } from './methods/groupBy'
import { implode as implodeFn } from './methods/implode'
import {
  intersect as intersectFn,
  intersectUsing as intersectUsingFn,
  intersectAssoc as intersectAssocFn,
  intersectAssocUsing as intersectAssocUsingFn
} from './methods/intersect'
import { join as joinFn } from './methods/join'
import { keyBy as keyByFn } from './methods/keyBy'
import { last as lastFn } from './methods/last'
import {
  map as mapFn,
  mapInto as mapIntoFn,
  mapSpread as mapSpreadFn,
  mapToGroups as mapToGroupsFn,
  mapWithKeys as mapWithKeysFn,
  flatMap as flatMapFn
} from './methods/map'
import {
  max as maxFn,
  min as minFn,
  median as medianFn,
  mode as modeFn,
  sum as sumFn,
  percentage as percentageFn
} from './methods/math'
import { pluck as pluckFn, pluckWithKey } from './methods/pluck'
import { sole as soleFn } from './methods/sole'
import {
  sort as sortFn,
  sortBy as sortByFn,
  sortByDesc as sortByDescFn,
  sortDesc as sortDescFn,
  sortKeys as sortKeysFn,
  sortKeysDesc as sortKeysDescFn,
  sortKeysUsing as sortKeysUsingFn
} from './methods/sort'
import { undot as undotFn } from './methods/undot'
import { union as unionFn } from './methods/union'
import { unique as uniqueFn } from './methods/unique'
import {
  where as whereFn,
  whereBetween as whereBetweenFn,
  whereIn as whereInFn,
  whereInStrict as whereInStrictFn,
  whereNotBetween as whereNotBetweenFn,
  whereNotIn as whereNotInFn,
  whereNotInStrict as whereNotInStrictFn,
  whereNotNull as whereNotNullFn,
  whereNull as whereNullFn
} from './methods/where'

export class Collection<T> implements IReadonlyCollection<T> {
  protected items: T[]

  private static readonly _macros: Map<
    string,
    (this: Collection<unknown>, ...args: ReadonlyArray<unknown>) => unknown
  > = new Map()

  constructor(items: T[] = []) {
    this.items = items
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]()
  }

  // ─── Static Factory Methods ──────────────────────────────────────────────────

  static make<T>(items: T[] = []): Collection<T> {
    return new Collection<T>(items)
  }

  static fromJson<T>(json: string): Collection<T> {
    const parsed = JSON.parse(json) as T | T[]
    if (Array.isArray(parsed)) {
      return new Collection<T>(parsed)
    }
    return new Collection<T>([parsed])
  }

  static times<T>(count: number, callback: (index: number) => T): Collection<T> {
    const items: T[] = []
    for (let i = 1; i <= count; i++) {
      items.push(callback(i))
    }
    return new Collection<T>(items)
  }

  static range(start: number, end: number): Collection<number> {
    return new Collection([...Array(end - start + 1).keys()].map((i) => i + start))
  }

  range(start: number, end: number): Collection<number> {
    return Collection.range(start, end)
  }

  static macro(
    name: string,
    fn: (this: Collection<unknown>, ...args: ReadonlyArray<unknown>) => unknown
  ): void {
    Collection._macros.set(name, fn)
    ;(Collection.prototype as unknown as Record<string, unknown>)[name] = function (
      this: Collection<unknown>,
      ...args: unknown[]
    ) {
      return fn.call(this, ...args)
    }
  }

  static hasMacro(name: string): boolean {
    return Collection._macros.has(name)
  }

  static wrap<T>(value: T | T[] | Collection<T>): Collection<T> {
    if (value instanceof Collection) return value.collect()
    if (Array.isArray(value)) return new Collection(value)
    return new Collection([value])
  }

  static unwrap<T>(value: T | T[] | Collection<T>): T | T[] {
    if (value instanceof Collection) return value.toArray()
    return value
  }

  // ─── Retrieval & Access ──────────────────────────────────────────────────────

  all(predicate?: Predicate<T>): T[] {
    return all(this.items, predicate)
  }

  first(predicate?: (item: T, index: number) => boolean): T | null {
    return firstFn(this.items, predicate)
  }

  firstOr<U>(defaultValue: U | (() => U), predicate?: (item: T, index: number) => boolean): T | U {
    const result = firstFn(this.items, predicate)
    if (result !== null) return result
    return typeof defaultValue === 'function' ? (defaultValue as () => U)() : defaultValue
  }

  firstOrFail(predicate?: (item: T, index: number) => boolean): T {
    return firstOrFailFn(this.items, predicate)
  }

  firstWhere<K extends keyof T>(key: K, value?: T[K], operator: string = '==='): T | null {
    return firstWhereFn(this.items, key, value, operator)
  }

  last(predicate?: (item: T, index: number) => boolean, errorFn?: () => void): T | undefined {
    return lastFn(this.items, predicate, errorFn)
  }

  lastOr<U>(defaultValue: U | (() => U), predicate?: (item: T, index: number) => boolean): T | U {
    const result = lastFn(this.items, predicate)
    if (result !== undefined) return result
    return typeof defaultValue === 'function' ? (defaultValue as () => U)() : defaultValue
  }

  get(index: number): T | undefined
  get(index: number, defaultValue: T): T
  get(index: number, defaultValue: () => T): T
  get(index: number, defaultValue?: T | (() => T)): T | undefined {
    if (index >= 0 && index < this.items.length) return this.items[index]
    if (index < 0 && Math.abs(index) <= this.items.length) {
      return this.items[this.items.length + index]
    }
    if (defaultValue !== undefined) {
      return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
    }
    return undefined
  }

  value<K extends keyof T>(key?: K | string): T | T[K] | unknown | undefined {
    if (key !== undefined) {
      if (this.items.length === 0) return undefined
      const keyStr = String(key)
      if (keyStr.includes('.')) {
        return getNestedValue(this.items[0], keyStr)
      }
      return this.items[0][key as K]
    }
    return this.items[0]
  }

  sole(key?: keyof T | ((item: T, index: number) => boolean), value?: T[keyof T]): T {
    return soleFn(this.items, key, value)
  }

  after(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    return after(this.items, item, strict)
  }

  before(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    return before(this.items, item, strict)
  }

  // ─── Search & Inspection ─────────────────────────────────────────────────────

  contains(value: T | PredicateContains<T> | Partial<T>): boolean
  contains<K extends keyof T>(key: K, value: T[K]): boolean
  contains<K extends keyof T>(
    valueOrKey: T | PredicateContains<T> | Partial<T> | K,
    value?: T[K]
  ): boolean {
    if (value !== undefined) {
      return containsByFn(this.items, valueOrKey as K, value)
    }
    return containsFn(this.items, valueOrKey as T | PredicateContains<T> | Partial<T>)
  }

  containsOneItem(callback?: PredicateContains<T>): boolean {
    if (callback) return this.items.filter(callback).length === 1
    return this.items.length === 1
  }

  containsStrict(value: T): boolean
  containsStrict<K extends keyof T>(key: K, value: T[K]): boolean
  containsStrict<K extends keyof T>(valueOrKey: T | K, value?: T[K]): boolean {
    if (value !== undefined) {
      return containsByStrictFn(this.items, valueOrKey as K, value)
    }
    return this.items.includes(valueOrKey as T)
  }

  doesntContain(value: T | PredicateContains<T> | Partial<T>): boolean
  doesntContain<K extends keyof T>(key: K, value: T[K]): boolean
  doesntContain<K extends keyof T>(
    valueOrKey: T | PredicateContains<T> | Partial<T> | K,
    value?: T[K]
  ): boolean {
    if (value !== undefined) {
      return !containsByFn(this.items, valueOrKey as K, value)
    }
    return !containsFn(this.items, valueOrKey as T | PredicateContains<T> | Partial<T>)
  }

  doesntContainStrict(value: T): boolean
  doesntContainStrict<K extends keyof T>(key: K, value: T[K]): boolean
  doesntContainStrict<K extends keyof T>(valueOrKey: T | K, value?: T[K]): boolean {
    if (value !== undefined) {
      return !containsByStrictFn(this.items, valueOrKey as K, value)
    }
    return !this.items.includes(valueOrKey as T)
  }

  every(callback: (item: T, index: number) => boolean): boolean {
    return this.items.every(callback)
  }

  some(callback: (item: T) => boolean): boolean {
    return this.items.some(callback)
  }

  search(
    value: T | ((item: T, index: number) => boolean),
    strict: boolean = false
  ): number | false {
    if (typeof value === 'function') {
      const index = this.items.findIndex(value as (item: T, index: number) => boolean)
      return index === -1 ? false : index
    }
    const index = strict
      ? this.items.findIndex((item) => item === value)
      : this.items.findIndex((item) => item == value)
    return index === -1 ? false : index
  }

  has<K extends keyof T>(key: K | K[]): boolean {
    const keys = Array.isArray(key) ? key : [key]
    return keys.every((k) =>
      this.items.some((item) => typeof item === 'object' && item !== null && k in item)
    )
  }

  hasAny<K extends keyof T>(keys: K[]): boolean {
    return keys.some((key) => this.has(key))
  }

  hasMany(callback?: (item: T) => boolean): boolean {
    if (callback) return this.items.filter(callback).length > 1
    return this.items.length > 1
  }

  hasSole(callback?: (item: T) => boolean): boolean {
    if (callback) return this.items.filter(callback).length === 1
    return this.items.length === 1
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isNotEmpty(): boolean {
    return this.items.length > 0
  }

  isList(): boolean {
    return this.items.every((_, index) => index === this.items.indexOf(this.items[index]))
  }

  count(): number {
    return this.items.length
  }

  // ─── Filtering ───────────────────────────────────────────────────────────────

  filter(callback?: (item: T, index: number, array: T[]) => boolean): Collection<T> {
    return new Collection(filterFn(this.items, callback))
  }

  reject(callback: (item: T, index?: number) => boolean): Collection<T> {
    return new Collection(this.items.filter((item, index) => !callback(item, index)))
  }

  where<K extends keyof T>(key: K, value: T[K]): Collection<T>
  where<K extends keyof T>(key: K, operator: string, value: T[K]): Collection<T>
  where<K extends keyof T>(key: K, operatorOrValue: string | T[K], value?: T[K]): Collection<T> {
    return new Collection(whereFn(this.items, key, operatorOrValue, value))
  }

  whereStrict<K extends keyof T>(key: K, value: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] === value))
  }

  whereBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(whereBetweenFn(this.items, key, min, max))
  }

  whereNotBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(whereNotBetweenFn(this.items, key, min, max))
  }

  whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(whereInFn(this.items, key, values))
  }

  whereInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(whereInStrictFn(this.items, key, values))
  }

  whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(whereNotInFn(this.items, key, values))
  }

  whereNotInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(whereNotInStrictFn(this.items, key, values))
  }

  whereInstanceOf<U extends object>(
    classType: abstract new (...args: ReadonlyArray<unknown>) => U
  ): Collection<U> {
    const ctor = classType as new (...args: unknown[]) => U
    return new Collection((this.items as unknown as U[]).filter((item) => item instanceof ctor))
  }

  whereNotNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(whereNotNullFn(this.items, key))
  }

  whereNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(whereNullFn(this.items, key))
  }

  // ─── Transformation ──────────────────────────────────────────────────────────

  make<U>(callback: (item: T, index: number, array: T[]) => U): Collection<U> {
    return new Collection(this.items.map(callback))
  }

  map<U>(callback: (item: T, index: number) => U): Collection<U> {
    return new Collection(mapFn(this.items, callback))
  }

  mapInto<U>(ClassType: new (item: T) => U): Collection<U> {
    return new Collection(mapIntoFn(this.items, ClassType))
  }

  mapSpread<U>(callback: (...args: T extends (infer I)[] ? I[] : never) => U): Collection<U> {
    return new Collection(mapSpreadFn(this.items, callback))
  }

  mapToGroups<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V[]> {
    return mapToGroupsFn(this.items, callback)
  }

  mapWithKeys<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V> {
    return mapWithKeysFn(this.items, callback)
  }

  flatMap<U>(callback: (item: T) => U[]): Collection<U> {
    return new Collection(flatMapFn(this.items, callback))
  }

  flatten(depth: number = Infinity): Collection<FlattenType<T>> {
    const flattenedItems = flattenHelper(this.items, depth) as FlattenType<T>[]
    return new Collection<FlattenType<T>>(flattenedItems)
  }

  collapse<U>(this: Collection<U[]>): Collection<U> {
    const flattened: U[] = []
    this.items.forEach((item) => {
      if (Array.isArray(item)) {
        flattened.push(...item)
      } else {
        flattened.push(item as unknown as U)
      }
    })
    return new Collection(flattened)
  }

  collapseWithKeys(): Collection<Record<string, unknown>> {
    const result: Record<string, unknown> = {}
    for (const item of this.items) {
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        for (const [key, value] of Object.entries(obj)) {
          result[key] = value instanceof Collection ? value.toArray() : value
        }
      }
    }
    return new Collection([result])
  }

  flip(): Collection<Record<string, number>> {
    return new Collection([flipFn(this.items)])
  }

  pluck<K extends keyof T>(key: K | string): Collection<T[K]>
  pluck<K extends keyof T, J extends keyof T>(
    key: K | string,
    keyBy: J | string
  ): Record<string, T[K]>
  pluck<K extends keyof T, J extends keyof T>(
    key: K | string,
    keyBy?: J | string
  ): Collection<T[K]> | Record<string, T[K]> {
    if (keyBy !== undefined) return pluckWithKey(this.items, key, keyBy)
    return new Collection(pluckFn(this.items, key))
  }

  transform(callback: (item: T, index: number) => T): this {
    this.items = this.items.map(callback)
    return this
  }

  replace(search: T, replace: T): Collection<T> {
    return new Collection(this.items.map((item) => (item === search ? replace : item)))
  }

  replaceRecursive(search: T, replace: T): Collection<T> {
    const replaceDeep = (item: unknown): unknown => {
      if (item === search) return replace
      if (Array.isArray(item)) return item.map(replaceDeep)
      if (isObject(item)) {
        const result: PlainObject = {}
        for (const [k, v] of Object.entries(item)) {
          result[k] = replaceDeep(v)
        }
        return result
      }
      return item
    }
    return new Collection(this.items.map((item) => replaceDeep(item) as T))
  }

  // ─── Sorting ─────────────────────────────────────────────────────────────────

  sort(callback?: (a: T, b: T) => number): Collection<T> {
    return new Collection(sortFn(this.items, callback))
  }

  sortBy<K extends keyof T>(
    key:
      | K
      | ((item: T, index: number) => unknown)
      | Array<[K, 'asc' | 'desc'] | ((a: T, b: T) => number)>
  ): Collection<T> {
    return new Collection(sortByFn(this.items, key))
  }

  sortByDesc<K extends keyof T>(key: K | ((item: T, index: number) => unknown)): Collection<T> {
    return new Collection(sortByDescFn(this.items, key))
  }

  sortDesc(): Collection<T> {
    return new Collection(sortDescFn(this.items))
  }

  sortKeys(): Collection<T> {
    return new Collection(sortKeysFn(this.items))
  }

  sortKeysDesc(): Collection<T> {
    return new Collection(sortKeysDescFn(this.items))
  }

  sortKeysUsing(callback: (a: string, b: string) => number): Collection<T> {
    return new Collection(sortKeysUsingFn(this.items, callback))
  }

  reverse(): Collection<T> {
    return new Collection([...this.items].reverse())
  }

  shuffle(): Collection<T> {
    const shuffled = [...this.items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return new Collection(shuffled)
  }

  // ─── Aggregation & Math ──────────────────────────────────────────────────────

  average(callback?: (item: T) => number): number {
    return averageFn(this.items, callback)
  }

  avg(callback?: (item: T) => number): number {
    return this.average(callback)
  }

  sum(callback?: ((item: T) => number) | keyof T): number {
    return sumFn(this.items, callback)
  }

  max(callback?: ((item: T) => number) | keyof T): number {
    return maxFn(this.items, callback)
  }

  min(callback?: ((item: T) => number) | keyof T): T | number | undefined {
    return minFn(this.items, callback)
  }

  median(callback?: (item: T) => number): number {
    return medianFn(this.items, callback)
  }

  mode(callback?: (item: T) => unknown): T | T[] | undefined {
    return modeFn(this.items, callback)
  }

  percentage(callback: (item: T) => boolean, precision: number = 2): number {
    return percentageFn(this.items, callback, precision)
  }

  countBy(iteratee?: Iteratee<T>): Record<string, number> {
    return countByFn(this.items, iteratee)
  }

  tally(): Record<string, number> {
    return this.items.reduce(
      (acc, item) => {
        const key = String(item)
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  // ─── Chunking & Partitioning ─────────────────────────────────────────────────

  chunk(size: number): Collection<Collection<T>> {
    return new Collection(chunkFn(this.items, size).map((c) => new Collection(c)))
  }

  chunkWhile(predicate: PredicateChunkWhile<T>): Collection<Collection<T>> {
    if (this.items.length === 0) return new Collection<Collection<T>>([])
    const chunks: Collection<T>[] = []
    let currentChunk: T[] = []
    for (let i = 0; i < this.items.length; i++) {
      if (i === 0 || predicate(this.items[i], i, this.items)) {
        currentChunk.push(this.items[i])
      } else {
        chunks.push(new Collection(currentChunk))
        currentChunk = [this.items[i]]
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(new Collection(currentChunk))
    }
    return new Collection(chunks)
  }

  split(numberOfGroups: number): Collection<T[]> {
    if (this.items.length === 0) return new Collection<T[]>([])
    const size = Math.ceil(this.items.length / numberOfGroups)
    const chunks: T[][] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  splitIn(numberOfGroups: number): Collection<T[]> {
    return this.split(numberOfGroups)
  }

  partition(callback: (item: T) => boolean): [Collection<T>, Collection<T>] {
    const [truthy, falsy] = this.items.reduce(
      ([trueArr, falseArr], item) => {
        if (callback(item)) trueArr.push(item)
        else falseArr.push(item)
        return [trueArr, falseArr]
      },
      [[], []] as [T[], T[]]
    )
    return [new Collection(truthy), new Collection(falsy)]
  }

  groupBy<K extends keyof T>(key: K | ((item: T, index: number) => string)): Record<string, T[]> {
    return groupByFn(this.items, key)
  }

  keyBy<K extends keyof T>(key: K | ((item: T, index: number) => string)): Record<string, T> {
    return keyByFn(this.items, key)
  }

  sliding(size: number, step: number = 1): Collection<T[]> {
    const chunks: T[][] = []
    for (let i = 0; i <= this.items.length - size; i += step) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  // ─── Slicing & Taking ────────────────────────────────────────────────────────

  take(count: number): Collection<T> {
    if (count < 0) return new Collection(this.items.slice(count))
    return new Collection(this.items.slice(0, count))
  }

  takeUntil(callback: T | ((item: T, index: number) => boolean)): Collection<T> {
    if (typeof callback === 'function') {
      const fn = callback as (item: T, index: number) => boolean
      const index = this.items.findIndex(fn)
      return index === -1 ? new Collection(this.items) : new Collection(this.items.slice(0, index))
    }
    const index = this.items.indexOf(callback as T)
    return index === -1 ? new Collection(this.items) : new Collection(this.items.slice(0, index))
  }

  takeWhile(callback: (item: T, index: number) => boolean): Collection<T> {
    const index = this.items.findIndex((item, i) => !callback(item, i))
    return index === -1 ? new Collection(this.items) : new Collection(this.items.slice(0, index))
  }

  skip(count: number): Collection<T> {
    return new Collection(this.items.slice(count))
  }

  skipUntil(callback: T | ((item: T, index: number) => boolean)): Collection<T> {
    if (typeof callback === 'function') {
      const fn = callback as (item: T, index: number) => boolean
      const index = this.items.findIndex(fn)
      return index === -1 ? new Collection<T>([]) : new Collection(this.items.slice(index))
    }
    const index = this.items.indexOf(callback as T)
    return index === -1 ? new Collection<T>([]) : new Collection(this.items.slice(index))
  }

  skipWhile(callback: (item: T, index: number) => boolean): Collection<T> {
    const index = this.items.findIndex((item, i) => !callback(item, i))
    return index === -1 ? new Collection<T>([]) : new Collection(this.items.slice(index))
  }

  slice(start: number, length?: number): Collection<T> {
    if (length !== undefined) return new Collection(this.items.slice(start, start + length))
    return new Collection(this.items.slice(start))
  }

  forPage(page: number, perPage: number): Collection<T> {
    return new Collection(this.items.slice((page - 1) * perPage, page * perPage))
  }

  nth(n: number, offset: number = 0): Collection<T> {
    const result: T[] = []
    for (let i = offset; i < this.items.length; i += n) result.push(this.items[i])
    return new Collection(result)
  }

  // ─── Addition & Removal ──────────────────────────────────────────────────────

  push(...values: T[]): this {
    this.items.push(...values)
    return this
  }

  prepend(value: T): Collection<T> {
    return new Collection([value, ...this.items])
  }

  concat<U>(items: U[] | Collection<U>): Collection<T | U> {
    const newItems = items instanceof Collection ? items.toArray() : items
    return new Collection((this.items as (T | U)[]).concat(newItems))
  }

  merge<U>(...args: (U[] | Collection<U>)[]): Collection<T | U> {
    const mergedItems = args.reduce<(T | U)[]>(
      (acc, arg) => {
        const items = arg instanceof Collection ? arg.toArray() : arg
        return acc.concat(items as (T | U)[])
      },
      [...this.items] as (T | U)[]
    )
    return new Collection<T | U>(mergedItems)
  }

  mergeRecursive<U>(...values: (U[] | Collection<U>)[]): Collection<T | U> {
    const target = this.items.map(deepClone)
    const arrays = values.map((val) =>
      val instanceof Collection ? val.toArray().map(deepClone) : val.map(deepClone)
    )
    const mergedArray = arrays.reduce(
      (acc, current) => mergeArrays(acc, current),
      target as (T | U)[]
    )
    return new Collection(mergedArray)
  }

  union(values: T[]): Collection<T> {
    return new Collection(unionFn(this.items, values))
  }

  pop(): T | undefined
  pop(count: number): Collection<T>
  pop(count?: number): T | undefined | Collection<T> {
    if (count !== undefined) {
      const popped = this.items.splice(-count, count).reverse()
      return new Collection(popped)
    }
    return this.items.pop()
  }

  shift(): T | undefined
  shift(count: number): Collection<T>
  shift(count?: number): T | undefined | Collection<T> {
    if (count !== undefined) {
      const shifted = this.items.splice(0, count)
      return new Collection(shifted)
    }
    return this.items.shift()
  }

  pull(value: T): Collection<T> {
    return new Collection(this.items.filter((item) => item !== value))
  }

  forget(index: number | string | (number | string)[]): Collection<T> {
    return new Collection(forgetFn(this.items, index))
  }

  splice(start: number, deleteCount?: number, ...values: T[]): Collection<T> {
    const copy = [...this.items]
    if (deleteCount !== undefined) copy.splice(start, deleteCount, ...values)
    else copy.splice(start)
    return new Collection(copy)
  }

  put<K extends keyof T, V extends T[K]>(key: K, value: V): Collection<T> {
    return new Collection(
      this.items.map((item) => {
        const copy = { ...item }
        copy[key] = value
        return copy
      })
    )
  }

  // ─── Set Operations ──────────────────────────────────────────────────────────

  diff(other: T[] | Collection<T>): Collection<T> {
    const otherItems = other instanceof Collection ? other.toArray() : other
    return new Collection(diffFn(this.items, otherItems))
  }

  diffAssoc(values: Collection<T> | T[]): Collection<T> {
    return new Collection(diffAssocFn(this.items, this.getArrayableItems(values)))
  }

  diffAssocUsing(values: T[], callback: (item: T) => unknown): Collection<T> {
    return new Collection(diffAssocUsingFn(this.items, values, callback))
  }

  diffKeys(values: Collection<T> | T[]): Collection<T> {
    const otherItems = this.getArrayableItems(values).reduce(
      (acc, item) => {
        Object.keys(item as Record<string, T>).forEach((key) => {
          acc[key] = true
        })
        return acc
      },
      {} as Record<string, boolean>
    )
    return new Collection(diffKeysFn(this.items, otherItems))
  }

  intersect(values: T[]): Collection<T> {
    return new Collection(intersectFn(this.items, values))
  }

  intersectUsing(values: T[], callback: (a: T, b: T) => number): Collection<T> {
    return new Collection(intersectUsingFn(this.items, values, callback))
  }

  intersectAssoc(values: T[]): Collection<T> {
    return new Collection(intersectAssocFn(this.items, values))
  }

  intersectAssocUsing(
    values: Record<string, unknown>,
    callback: (a: string, b: string) => number
  ): Collection<Record<string, unknown>> {
    return new Collection([intersectAssocUsingFn(this.items, values, callback)])
  }

  intersectByKeys<K extends keyof T>(keys: K[]): Collection<T> {
    return new Collection(this.items.filter((item) => keys.includes(item as unknown as K)))
  }

  crossJoin<U>(...arrays: U[][]): Collection<(T | U)[]> {
    return new Collection<(T | U)[]>(crossJoinFn(this.items, ...arrays))
  }

  // ─── Unique & Duplicates ─────────────────────────────────────────────────────

  unique(callback?: ((item: T) => unknown) | keyof T): Collection<T> {
    return new Collection(uniqueFn(this.items, callback))
  }

  uniqueStrict(): Collection<T> {
    return new Collection([...new Set(this.items)])
  }

  duplicates(key?: keyof T): Collection<T> {
    return new Collection(duplicatesFn(this.items, key))
  }

  duplicatesStrict(key?: keyof T): Collection<T> {
    return new Collection(duplicatesStrictFn(this.items, key))
  }

  // ─── Object Key Operations ───────────────────────────────────────────────────

  keys(): (keyof T | string | number)[] {
    if (Array.isArray(this.items)) {
      if (this.items.every((item) => Array.isArray(item))) {
        return this.items.map((_, index) => index.toString())
      } else if (this.items.every((item) => typeof item === 'object' && item !== null)) {
        const mergedKeys = this.items.reduce((keys, item) => {
          if (typeof item === 'object' && item !== null) {
            return keys.concat(Object.keys(item as Record<string, unknown>))
          }
          return keys
        }, [] as string[])
        return Array.from(new Set(mergedKeys)) as (keyof T)[]
      }
    }
    return this.items.map((_, index) => index.toString())
  }

  values(): Collection<T> {
    return new Collection([...this.items])
  }

  only(keys: string[]): Collection<Record<string, T[keyof T] | undefined>> {
    return new Collection(
      this.items.map((item) => {
        const copy: Record<string, T[keyof T] | undefined> = {}
        if (typeof item === 'object' && item !== null) {
          const record = item as Record<string, T[keyof T]>
          keys.forEach((key) => {
            copy[key] = key in record ? record[key] : undefined
          })
        } else {
          keys.forEach((key) => {
            copy[key] = undefined
          })
        }
        return copy
      })
    )
  }

  except<K extends keyof T>(keys: K[]): Collection<Omit<T, K>> {
    return new Collection(
      this.items.map((item) => {
        const copy = { ...item }
        keys.forEach((key) => delete copy[key])
        return copy
      }) as Omit<T, K>[]
    )
  }

  select<K extends keyof T>(keys: K | K[]): Collection<Pick<T, K>> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    return new Collection(
      this.items.map((item) => {
        const result = {} as Pick<T, K>
        keyArray.forEach((key) => {
          result[key] = item[key]
        })
        return result
      })
    )
  }

  dot(): Record<string, unknown> {
    return dotFn(this.items)
  }

  undot(): Collection<Record<string, unknown>> {
    return new Collection([undotFn(this.items)])
  }

  // ─── Iteration ───────────────────────────────────────────────────────────────

  each(callback: (item: T, index: number) => void | boolean): this {
    eachFn(this.items, callback)
    return this
  }

  eachSpread(callback: (...args: T extends (infer R)[] ? R[] : T[]) => void | boolean): this {
    eachSpreadFn(this.items, callback)
    return this
  }

  tapEach(callback: (item: T, index: number) => void): this {
    this.items.forEach((item, index) => callback(item, index))
    return this
  }

  // ─── Reduction ───────────────────────────────────────────────────────────────

  reduce<U>(callback: (accumulator: U, item: T, index: number) => U, initialValue: U): U
  reduce(callback: (accumulator: T, item: T, index: number) => T): T
  reduce<U>(
    callback: (accumulator: U | T, item: T, index: number) => U | T,
    initialValue?: U
  ): U | T {
    if (initialValue !== undefined) {
      return this.items.reduce(callback as (acc: U, item: T, index: number) => U, initialValue)
    }
    return this.items.reduce(callback as (acc: T, item: T, index: number) => T)
  }

  reduceSpread(
    callback: (...args: unknown[]) => unknown[],
    ...initialValues: unknown[]
  ): unknown[] {
    return this.items.reduce<unknown[]>(
      (carry, item) => callback(...carry, item) as unknown[],
      initialValues
    )
  }

  // ─── String Operations ───────────────────────────────────────────────────────

  implode(glue: string | ((item: T, index: number) => string), key?: keyof T): string {
    return implodeFn(this.items, glue, key)
  }

  join(separator: string, finalSeparator?: string): string {
    return joinFn(this.items, separator, finalSeparator)
  }

  // ─── Conditional Execution ───────────────────────────────────────────────────

  when(
    condition: boolean | ((collection: Collection<T>) => boolean),
    callback: (collection: Collection<T>) => Collection<T> | void,
    fallback?: (collection: Collection<T>) => Collection<T> | void
  ): Collection<T> {
    const resolvedCondition = typeof condition === 'function' ? condition(this) : condition
    if (resolvedCondition) {
      const result = callback(this)
      return result instanceof Collection ? result : this
    } else if (fallback) {
      const result = fallback(this)
      return result instanceof Collection ? result : this
    }
    return this
  }

  whenEmpty(
    callback: (collection: Collection<T>) => Collection<T> | void,
    fallback?: (collection: Collection<T>) => Collection<T> | void
  ): Collection<T> {
    return this.when(this.isEmpty(), callback, fallback)
  }

  whenNotEmpty(
    callback: (collection: Collection<T>) => Collection<T> | void,
    fallback?: (collection: Collection<T>) => Collection<T> | void
  ): Collection<T> {
    return this.when(this.isNotEmpty(), callback, fallback)
  }

  unless(
    condition: boolean | ((collection: Collection<T>) => boolean),
    callback: (collection: Collection<T>) => Collection<T> | void,
    fallback?: (collection: Collection<T>) => Collection<T> | void
  ): Collection<T> {
    const resolvedCondition = typeof condition === 'function' ? condition(this) : condition
    return this.when(!resolvedCondition, callback, fallback)
  }

  unlessEmpty(callback: (collection: Collection<T>) => Collection<T> | void): Collection<T> {
    return this.whenNotEmpty(callback)
  }

  unlessNotEmpty(callback: (collection: Collection<T>) => Collection<T> | void): Collection<T> {
    return this.whenEmpty(callback)
  }

  // ─── Piping & Tapping ────────────────────────────────────────────────────────

  pipe<U>(callback: (collection: Collection<T>) => U): U {
    return callback(this)
  }

  pipeInto<U>(ClassType: new (collection: Collection<T>) => U): U {
    return new ClassType(this)
  }

  pipeThrough(pipes: Array<(value: unknown) => unknown>): unknown {
    return pipes.reduce<unknown>((carry, pipe) => pipe(carry), this)
  }

  tap(callback: (collection: Collection<T>) => void): this {
    callback(this)
    return this
  }

  // ─── Type Checking ───────────────────────────────────────────────────────────

  ensure(...types: Array<{ new (...args: T[]): T } | string>): this {
    for (const item of this.items) {
      const isValid = types.some((type) => {
        if (typeof type === 'string') return typeof item === type
        return item instanceof type
      })
      if (!isValid) {
        throw new UnexpectedValueException(`Item ${String(item)} is not of the expected type(s)`)
      }
    }
    return this
  }

  // ─── Padding & Multiplication ────────────────────────────────────────────────

  pad(size: number, value: T): Collection<T> {
    const newItems = [...this.items]
    if (size < 0) {
      const absSize = Math.abs(size)
      while (newItems.length < absSize) newItems.unshift(value)
    } else {
      while (newItems.length < size) newItems.push(value)
    }
    return new Collection(newItems)
  }

  multiply(count: number): Collection<T> {
    const result: T[] = []
    for (let i = 0; i < count; i++) result.push(...this.items)
    return new Collection(result)
  }

  repeat(count: number): Collection<T> {
    return this.multiply(count)
  }

  times(count: number): Collection<T> {
    return this.multiply(count)
  }

  wrap(): Collection<T[]> {
    return new Collection([this.items])
  }

  unwrap(): T | T[] {
    return this.items.length === 1 ? this.items[0] : this.items
  }

  // ─── Random ──────────────────────────────────────────────────────────────────

  random(): T | undefined
  random(count: number): Collection<T>
  random(count: (collection: Collection<T>) => number): Collection<T>
  random(count?: number | ((collection: Collection<T>) => number)): T | Collection<T> | undefined {
    if (count === undefined) {
      return this.items[Math.floor(Math.random() * this.items.length)]
    }
    const n = typeof count === 'function' ? count(this) : count
    if (n > this.items.length) {
      throw new Error(
        `You requested ${n} items, but the collection only contains ${this.items.length} items.`
      )
    }
    const shuffled = [...this.items].sort(() => Math.random() - 0.5)
    return new Collection(shuffled.slice(0, n))
  }

  // ─── Combine & Zip ──────────────────────────────────────────────────────────

  combine<U>(values: readonly (U | undefined)[]): Collection<[T, U | undefined]> {
    const combined: [T, U | undefined][] = []
    for (let i = 0; i < this.items.length; i++) {
      combined.push([this.items[i], values[i]])
    }
    return new Collection(combined)
  }

  zip<U>(values: U[]): Collection<[T, U]> {
    const zipped: [T, U][] = []
    for (let i = 0; i < this.items.length; i++) {
      zipped.push([this.items[i], values[i]])
    }
    return new Collection(zipped)
  }

  // ─── Serialization & Conversion ──────────────────────────────────────────────

  toArray(): T[] {
    return this.items
  }

  toJson(): string {
    return JSON.stringify(this.items)
  }

  toPrettyJson(indent: number = 2): string {
    return JSON.stringify(this.items, null, indent)
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.items) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  toSet(): Set<T> {
    return new Set(this.items)
  }

  toString(): string {
    return this.toJson()
  }

  valueOf(): T[] {
    return this.toArray()
  }

  // ─── Cloning & Collecting ────────────────────────────────────────────────────

  collect(): Collection<T> {
    return new Collection(this.items)
  }

  clone(): Collection<T> {
    return new Collection(this.items.map(deepClone))
  }

  lazy(): LazyCollection<T> {
    return new LazyCollection<T>(this.items)
  }

  // ─── Debugging ───────────────────────────────────────────────────────────────

  dump(): this {
    console.log(this.items)
    return this
  }

  dd(): never {
    this.dump()
    throw new Error('Dump and die: Collection debugging terminated.')
  }

  // ─── JS Protocol Methods ──────────────────────────────────────────────────

  get [Symbol.toStringTag](): string {
    return 'Collection'
  }

  toJSON(): T[] {
    return this.items
  }

  [Symbol.toPrimitive](hint: string): string | number | T[] {
    if (hint === 'number') return this.items.length
    if (hint === 'string') return this.toJson()
    return this.items
  }

  get length(): number {
    return this.items.length
  }

  // ─── Static Converters ─────────────────────────────────────────────────────

  static fromEntries<V>(entries: Iterable<[string, V]>): Collection<Record<string, V>> {
    return new Collection([Object.fromEntries(entries) as Record<string, V>])
  }

  static fromMap<K, V>(map: Map<K, V>): Collection<[K, V]> {
    return new Collection([...map.entries()])
  }

  static fromSet<T>(set: Set<T>): Collection<T> {
    return new Collection([...set])
  }

  static empty<T>(): Collection<T> {
    return new Collection<T>([])
  }

  // ─── Node.js Utilities ─────────────────────────────────────────────────────

  toObject<K extends keyof T, V extends keyof T>(keyField: K, valueField: V): Record<string, T[V]> {
    const result: Record<string, T[V]> = {}
    for (const item of this.items) {
      result[String(item[keyField])] = item[valueField]
    }
    return result
  }

  toEntries<K extends keyof T, V extends keyof T>(keyField: K, valueField: V): [T[K], T[V]][] {
    return this.items.map((item) => [item[keyField], item[valueField]])
  }

  // ─── Internal Helpers ────────────────────────────────────────────────────────

  protected getArrayableItems(items: Collection<T> | T[]): T[] {
    if (items instanceof Collection) return items.toArray()
    return items
  }

  isEqual(value: T, other: T): boolean {
    return isDeepEqual(value, other)
  }
}
