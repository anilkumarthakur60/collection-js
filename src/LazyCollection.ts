import { Collection } from './Collection'
import { ItemNotFoundException, MultipleItemsFoundException } from './exceptions'
import { isDeepEqual, getNestedValue } from './internals'
import type { ILazyCollection } from './types'

export class LazyCollection<T> implements ILazyCollection<T> {
  private readonly generatorFn: () => Generator<T>

  constructor(source: T[] | (() => Generator<T>)) {
    if (typeof source === 'function') {
      this.generatorFn = source
    } else {
      const items = [...source]
      this.generatorFn = function* () {
        yield* items
      }
    }
  }

  // ─── Static Factories ────────────────────────────────────────────────────────

  static make<T>(source: T[] | (() => Generator<T>)): LazyCollection<T> {
    return new LazyCollection<T>(source)
  }

  static fromIterable<T>(iterable: Iterable<T>): LazyCollection<T> {
    return new LazyCollection<T>(function* () {
      yield* iterable
    })
  }

  static range(start: number, end: number): LazyCollection<number> {
    return new LazyCollection<number>(function* () {
      for (let i = start; i <= end; i++) {
        yield i
      }
    })
  }

  static times<T>(count: number, callback: (index: number) => T): LazyCollection<T> {
    return new LazyCollection<T>(function* () {
      for (let i = 1; i <= count; i++) {
        yield callback(i)
      }
    })
  }

  static repeat<T>(value: T, count: number): LazyCollection<T> {
    return new LazyCollection<T>(function* () {
      for (let i = 0; i < count; i++) {
        yield value
      }
    })
  }

  static wrap<T>(value: T | T[] | LazyCollection<T>): LazyCollection<T> {
    if (value instanceof LazyCollection) return value
    if (Array.isArray(value)) return new LazyCollection(value)
    return new LazyCollection([value])
  }

  static unwrap<T>(value: T | T[] | LazyCollection<T>): T | T[] {
    if (value instanceof LazyCollection) return value.all()
    return value
  }

  // ─── Iterable Protocol ───────────────────────────────────────────────────────

  *[Symbol.iterator](): Generator<T> {
    yield* this.generatorFn()
  }

  private _iter(): () => Generator<T> {
    return this.generatorFn
  }

  // ─── Eager Terminal — Retrieval ──────────────────────────────────────────────

  all(): T[] {
    return [...this]
  }

  toArray(): T[] {
    return [...this]
  }

  count(): number {
    let n = 0
    const iterator = this[Symbol.iterator]()
    while (!iterator.next().done) n++
    return n
  }

  first(predicate?: (item: T, index: number) => boolean): T | null {
    if (predicate) {
      let i = 0
      for (const item of this) {
        if (predicate(item, i++)) return item
      }
      return null
    }
    for (const item of this) return item
    return null
  }

  firstOr<U>(defaultValue: U | (() => U), predicate?: (item: T, index: number) => boolean): T | U {
    const result = this.first(predicate)
    if (result !== null) return result
    return typeof defaultValue === 'function' ? (defaultValue as () => U)() : defaultValue
  }

  firstOrFail(predicate?: (item: T, index: number) => boolean): T {
    const result = this.first(predicate)
    if (result !== null) return result
    throw new ItemNotFoundException('No items found in the collection.')
  }

  firstWhere<K extends keyof T>(key: K, value?: T[K], operator: string = '==='): T | null {
    for (const item of this) {
      if (value === undefined) {
        if (item[key]) return item
      } else {
        switch (operator) {
          case '===':
            if (item[key] === value) return item
            break
          case '!==':
            if (item[key] !== value) return item
            break
          case '<':
            if (item[key] < value!) return item
            break
          case '<=':
            if (item[key] <= value!) return item
            break
          case '>':
            if (item[key] > value!) return item
            break
          case '>=':
            if (item[key] >= value!) return item
            break
        }
      }
    }
    return null
  }

  last(predicate?: (item: T, index: number) => boolean): T | null {
    let last: T | null = null
    let i = 0
    for (const item of this) {
      if (!predicate || predicate(item, i++)) last = item
    }
    return last
  }

  sole(predicate?: (item: T, index: number) => boolean): T {
    let found: T | undefined
    let count = 0
    let i = 0
    for (const item of this) {
      if (!predicate || predicate(item, i++)) {
        found = item
        count++
        if (count > 1) throw new MultipleItemsFoundException(count)
      }
    }
    if (count === 0) throw new ItemNotFoundException('No items found in the collection.')
    return found!
  }

  value<K extends keyof T>(key?: K | string): T | T[K] | unknown | undefined {
    const item: T | null = this.first()
    if (item === null || item === undefined) return undefined
    if (key !== undefined) {
      const keyStr = String(key)
      if (keyStr.includes('.')) return getNestedValue(item as unknown, keyStr)
      return (item as T)[key as K]
    }
    return item
  }

  // ─── Eager Terminal — Search & Inspection ────────────────────────────────────

  contains(value: T | ((item: T) => boolean)): boolean
  contains<K extends keyof T>(key: K, value: T[K]): boolean
  contains<K extends keyof T>(valueOrKey: T | ((item: T) => boolean) | K, value?: T[K]): boolean {
    if (value !== undefined) {
      for (const item of this) {
        if (item[valueOrKey as K] == value) return true
      }
      return false
    }
    if (typeof valueOrKey === 'function') {
      const predicate = valueOrKey as (item: T) => boolean
      for (const item of this) {
        if (predicate(item)) return true
      }
      return false
    }
    for (const item of this) {
      if (item === valueOrKey) return true
    }
    return false
  }

  doesntContain(value: T | ((item: T) => boolean)): boolean {
    return !this.contains(value)
  }

  every(callback: (item: T) => boolean): boolean {
    for (const item of this) {
      if (!callback(item)) return false
    }
    return true
  }

  some(callback: (item: T) => boolean): boolean {
    for (const item of this) {
      if (callback(item)) return true
    }
    return false
  }

  search(
    value: T | ((item: T, index: number) => boolean),
    strict: boolean = false
  ): number | false {
    let i = 0
    if (typeof value === 'function') {
      const fn = value as (item: T, index: number) => boolean
      for (const item of this) {
        if (fn(item, i)) return i
        i++
      }
      return false
    }
    for (const item of this) {
      if (strict ? item === value : item == value) return i
      i++
    }
    return false
  }

  has<K extends keyof T>(key: K | K[]): boolean {
    const keys = Array.isArray(key) ? key : [key]
    return keys.every((k) =>
      this.some((item) => typeof item === 'object' && item !== null && k in item)
    )
  }

  isEmpty(): boolean {
    return this.first() === null
  }

  isNotEmpty(): boolean {
    return !this.isEmpty()
  }

  // ─── Eager Terminal — Aggregation ────────────────────────────────────────────

  reduce<U>(callback: (accumulator: U, item: T, index: number) => U, initial: U): U {
    let acc = initial
    let i = 0
    for (const item of this) {
      acc = callback(acc, item, i++)
    }
    return acc
  }

  sum(callback?: ((item: T) => number) | keyof T): number {
    return this.reduce((acc, item) => {
      if (callback) {
        if (typeof callback === 'function') return acc + callback(item)
        return acc + Number((item as Record<string, unknown>)[callback as string])
      }
      return acc + Number(item)
    }, 0)
  }

  avg(callback?: ((item: T) => number) | keyof T): number {
    let total = 0
    let count = 0
    for (const item of this) {
      if (callback) {
        if (typeof callback === 'function') total += callback(item)
        else total += Number((item as Record<string, unknown>)[callback as string])
      } else {
        total += Number(item)
      }
      count++
    }
    return count === 0 ? 0 : total / count
  }

  average(callback?: ((item: T) => number) | keyof T): number {
    return this.avg(callback)
  }

  min(callback?: ((item: T) => number) | keyof T): number {
    let result = Infinity
    for (const item of this) {
      let val: number
      if (callback) {
        if (typeof callback === 'function') val = callback(item)
        else val = Number((item as Record<string, unknown>)[callback as string])
      } else {
        val = Number(item)
      }
      if (val < result) result = val
    }
    return result
  }

  max(callback?: ((item: T) => number) | keyof T): number {
    let result = -Infinity
    for (const item of this) {
      let val: number
      if (callback) {
        if (typeof callback === 'function') val = callback(item)
        else val = Number((item as Record<string, unknown>)[callback as string])
      } else {
        val = Number(item)
      }
      if (val > result) result = val
    }
    return result
  }

  median(callback?: (item: T) => number): number {
    const sorted = callback
      ? [...this].map(callback).sort((a, b) => a - b)
      : [...this].map(Number).sort((a, b) => a - b)
    if (sorted.length === 0) return 0
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }

  mode(callback?: (item: T) => unknown): T | T[] | undefined {
    return this.collect().mode(callback)
  }

  countBy(
    iteratee?: (item: T) => string | number | boolean | symbol | null
  ): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const item of this) {
      const key = iteratee ? String(iteratee(item)) : String(item)
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }

  percentage(callback: (item: T) => boolean, precision: number = 2): number {
    let matching = 0
    let total = 0
    for (const item of this) {
      if (callback(item)) matching++
      total++
    }
    if (total === 0) return 0
    return Number(((matching / total) * 100).toFixed(precision))
  }

  // ─── Eager Terminal — String ─────────────────────────────────────────────────

  implode(glue: string | ((item: T, index: number) => string), key?: keyof T): string {
    if (typeof glue === 'function') {
      return [...this].map((item, i) => glue(item, i)).join('')
    }
    if (key !== undefined) {
      return [...this].map((item) => String(item[key])).join(glue)
    }
    return [...this].map(String).join(glue)
  }

  join(separator: string, finalSeparator?: string): string {
    const arr = [...this].map(String)
    if (!finalSeparator || arr.length <= 1) return arr.join(separator)
    const last = arr.pop()
    return arr.join(separator) + finalSeparator + last
  }

  // ─── Eager Iteration ─────────────────────────────────────────────────────────

  each(callback: (item: T, index: number) => void | false): this {
    let i = 0
    for (const item of this) {
      if (callback(item, i++) === false) break
    }
    return this
  }

  eachSpread(callback: (...args: T extends (infer R)[] ? R[] : T[]) => void | boolean): this {
    for (const item of this) {
      if (Array.isArray(item)) {
        const result = (callback as (...args: unknown[]) => void | boolean)(...item)
        if (result === false) break
      }
    }
    return this
  }

  // ─── Lazy Transformation ─────────────────────────────────────────────────────

  map<U>(callback: (item: T, index: number) => U): LazyCollection<U> {
    const source = this._iter()
    return new LazyCollection<U>(function* () {
      let i = 0
      for (const item of source()) {
        yield callback(item, i++)
      }
    })
  }

  mapInto<U>(ClassType: new (item: T) => U): LazyCollection<U> {
    return this.map((item) => new ClassType(item))
  }

  mapSpread<U>(callback: (...args: T extends (infer I)[] ? I[] : never) => U): LazyCollection<U> {
    const source = this._iter()
    return new LazyCollection<U>(function* () {
      for (const item of source()) {
        if (Array.isArray(item)) {
          yield (callback as (...args: unknown[]) => U)(...item)
        }
      }
    })
  }

  mapWithKeys<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V> {
    const result = {} as Record<K, V>
    let i = 0
    for (const item of this) {
      const [key, value] = callback(item, i++)
      result[key] = value
    }
    return result
  }

  mapToGroups<K extends string, V>(callback: (item: T, index: number) => [K, V]): Record<K, V[]> {
    const result = {} as Record<K, V[]>
    let i = 0
    for (const item of this) {
      const [key, value] = callback(item, i++)
      if (!result[key]) result[key] = []
      result[key].push(value)
    }
    return result
  }

  flatMap<U>(callback: (item: T, index: number) => Iterable<U>): LazyCollection<U> {
    const source = this._iter()
    return new LazyCollection<U>(function* () {
      let i = 0
      for (const item of source()) {
        yield* callback(item, i++)
      }
    })
  }

  flatten(depth: number = Infinity): LazyCollection<unknown> {
    const source = this._iter()
    function* flattenGen(iterable: Iterable<unknown>, d: number): Generator<unknown> {
      for (const item of iterable) {
        if (
          d > 0 &&
          (Array.isArray(item) || (item && typeof item === 'object' && Symbol.iterator in item))
        ) {
          yield* flattenGen(item as Iterable<unknown>, d - 1)
        } else {
          yield item
        }
      }
    }
    return new LazyCollection<unknown>(function* () {
      yield* flattenGen(source(), depth)
    })
  }

  collapse(): LazyCollection<unknown> {
    return this.flatten(1)
  }

  filter(callback?: (item: T, index: number) => boolean): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of source()) {
        if (callback) {
          if (callback(item, i++)) yield item
        } else {
          i++
          if (item) yield item
        }
      }
    })
  }

  reject(callback: (item: T, index: number) => boolean): LazyCollection<T> {
    return this.filter((item, index) => !callback(item, index))
  }

  chunk(size: number): LazyCollection<T[]> {
    const source = this._iter()
    return new LazyCollection<T[]>(function* () {
      let current: T[] = []
      for (const item of source()) {
        current.push(item)
        if (current.length >= size) {
          yield current
          current = []
        }
      }
      if (current.length > 0) yield current
    })
  }

  chunkWhile(predicate: (item: T, index: number, array: T[]) => boolean): LazyCollection<T[]> {
    const source = this._iter()
    return new LazyCollection<T[]>(function* () {
      let current: T[] = []
      let i = 0
      for (const item of source()) {
        if (i === 0 || predicate(item, i, current)) {
          current.push(item)
        } else {
          yield current
          current = [item]
        }
        i++
      }
      if (current.length > 0) yield current
    })
  }

  unique(callback?: ((item: T) => unknown) | keyof T): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      const seen = new Set<unknown>()
      for (const item of source()) {
        let key: unknown
        if (typeof callback === 'function') key = callback(item)
        else if (callback !== undefined) key = item[callback]
        else key = item
        if (!seen.has(key)) {
          seen.add(key)
          yield item
        }
      }
    })
  }

  uniqueStrict(): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      const seen: T[] = []
      for (const item of source()) {
        if (!seen.includes(item)) {
          seen.push(item)
          yield item
        }
      }
    })
  }

  duplicates(key?: keyof T): LazyCollection<T> {
    return LazyCollection.fromIterable(this.collect().duplicates(key))
  }

  pluck<K extends keyof T>(key: K | string): LazyCollection<T[K]> {
    const keyStr = String(key)
    if (keyStr.includes('.')) {
      return this.map((item) => getNestedValue(item, keyStr) as T[K])
    }
    return this.map((item) => item[key as K])
  }

  flip(): LazyCollection<Record<string, number>> {
    return LazyCollection.fromIterable(this.collect().flip())
  }

  // ─── Lazy Slicing & Taking ───────────────────────────────────────────────────

  take(count: number): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      if (count <= 0) return
      let taken = 0
      for (const item of source()) {
        yield item
        if (++taken >= count) break
      }
    })
  }

  takeUntil(callback: T | ((item: T) => boolean)): LazyCollection<T> {
    const source = this._iter()
    const predicate =
      typeof callback === 'function'
        ? (callback as (item: T) => boolean)
        : (item: T) => item === callback
    return new LazyCollection<T>(function* () {
      for (const item of source()) {
        if (predicate(item)) break
        yield item
      }
    })
  }

  takeWhile(callback: (item: T) => boolean): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      for (const item of source()) {
        if (!callback(item)) break
        yield item
      }
    })
  }

  skip(count: number): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let skipped = 0
      for (const item of source()) {
        if (skipped < count) {
          skipped++
          continue
        }
        yield item
      }
    })
  }

  skipUntil(callback: T | ((item: T) => boolean)): LazyCollection<T> {
    const source = this._iter()
    const predicate =
      typeof callback === 'function'
        ? (callback as (item: T) => boolean)
        : (item: T) => item === callback
    return new LazyCollection<T>(function* () {
      let skipping = true
      for (const item of source()) {
        if (skipping && predicate(item)) skipping = false
        if (!skipping) yield item
      }
    })
  }

  skipWhile(callback: (item: T) => boolean): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let skipping = true
      for (const item of source()) {
        if (skipping && callback(item)) continue
        skipping = false
        yield item
      }
    })
  }

  slice(start: number, length?: number): LazyCollection<T> {
    let result: LazyCollection<T> = this.skip(start)
    if (length !== undefined) result = result.take(length)
    return result
  }

  forPage(page: number, perPage: number): LazyCollection<T> {
    return this.skip((page - 1) * perPage).take(perPage)
  }

  nth(n: number, offset: number = 0): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of source()) {
        if (i >= offset && (i - offset) % n === 0) yield item
        i++
      }
    })
  }

  // ─── Lazy Filtering (where family) ───────────────────────────────────────────

  where<K extends keyof T>(key: K, value: T[K]): LazyCollection<T>
  where<K extends keyof T>(key: K, operator: string, value: T[K]): LazyCollection<T>
  where<K extends keyof T>(
    key: K,
    operatorOrValue: string | T[K],
    value?: T[K]
  ): LazyCollection<T> {
    if (value === undefined) {
      return this.filter((item) => item[key] === operatorOrValue)
    }
    const operator = operatorOrValue as string
    return this.filter((item) => {
      switch (operator) {
        case '=':
        case '==':
          return item[key] == value
        case '===':
          return item[key] === value
        case '!=':
        case '<>':
          return item[key] != value
        case '!==':
          return item[key] !== value
        case '<':
          return item[key] < value!
        case '<=':
          return item[key] <= value!
        case '>':
          return item[key] > value!
        case '>=':
          return item[key] >= value!
        default:
          return item[key] === value
      }
    })
  }

  whereStrict<K extends keyof T>(key: K, value: T[K]): LazyCollection<T> {
    return this.filter((item) => item[key] === value)
  }

  whereBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): LazyCollection<T> {
    return this.filter((item) => item[key] >= min && item[key] <= max)
  }

  whereNotBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): LazyCollection<T> {
    return this.filter((item) => item[key] < min || item[key] > max)
  }

  whereIn<K extends keyof T>(key: K, values: T[K][]): LazyCollection<T> {
    return this.filter((item) => values.includes(item[key]))
  }

  whereInStrict<K extends keyof T>(key: K, values: T[K][]): LazyCollection<T> {
    return this.filter((item) => values.some((v) => v === item[key]))
  }

  whereNotIn<K extends keyof T>(key: K, values: T[K][]): LazyCollection<T> {
    return this.filter((item) => !values.includes(item[key]))
  }

  whereNotInStrict<K extends keyof T>(key: K, values: T[K][]): LazyCollection<T> {
    return this.filter((item) => !values.some((v) => v === item[key]))
  }

  whereInstanceOf<U extends object>(
    classType: abstract new (...args: ReadonlyArray<unknown>) => U
  ): LazyCollection<U> {
    const ctor = classType as new (...args: unknown[]) => U
    return (this as unknown as LazyCollection<U>).filter((item) => item instanceof ctor)
  }

  whereNotNull<K extends keyof T>(key: K): LazyCollection<T> {
    return this.filter((item) => item[key] !== null && item[key] !== undefined)
  }

  whereNull<K extends keyof T>(key: K): LazyCollection<T> {
    return this.filter((item) => item[key] === null || item[key] === undefined)
  }

  // ─── Lazy Set Operations ─────────────────────────────────────────────────────

  diff(other: T[] | LazyCollection<T>): LazyCollection<T> {
    const otherArr = other instanceof LazyCollection ? other.all() : other
    return this.filter((item) => !otherArr.includes(item))
  }

  diffAssoc(other: T[]): LazyCollection<T> {
    return this.filter((item) => !other.some((o) => isDeepEqual(item, o)))
  }

  diffKeys(other: Record<string, boolean>): LazyCollection<T> {
    return this.filter((item) => {
      if (typeof item !== 'object' || item === null) return true
      return !Object.keys(item as Record<string, unknown>).some((k) => k in other)
    })
  }

  intersect(other: T[]): LazyCollection<T> {
    return this.filter((item) => other.includes(item))
  }

  intersectByKeys<K extends keyof T>(keys: K[]): LazyCollection<T> {
    return this.filter((item) => keys.includes(item as unknown as K))
  }

  union(values: T[]): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      const seen = new Set<T>()
      for (const item of source()) {
        seen.add(item)
        yield item
      }
      for (const item of values) {
        if (!seen.has(item)) {
          seen.add(item)
          yield item
        }
      }
    })
  }

  crossJoin<U>(...arrays: U[][]): LazyCollection<(T | U)[]> {
    return LazyCollection.fromIterable(this.collect().crossJoin(...arrays))
  }

  // ─── Lazy Combination ────────────────────────────────────────────────────────

  concat<U>(items: Iterable<U>): LazyCollection<T | U> {
    const source = this._iter()
    return new LazyCollection<T | U>(function* () {
      yield* source()
      yield* items
    })
  }

  merge<U>(items: Iterable<U>): LazyCollection<T | U> {
    return this.concat(items)
  }

  combine<U>(values: U[]): LazyCollection<[T, U | undefined]> {
    const source = this._iter()
    return new LazyCollection<[T, U | undefined]>(function* () {
      let i = 0
      for (const item of source()) {
        yield [item, values[i++]]
      }
    })
  }

  zip<U>(values: Iterable<U>): LazyCollection<[T, U]> {
    const source = this._iter()
    return new LazyCollection<[T, U]>(function* () {
      const iter1 = source()
      const iter2 = (values as Iterable<U>)[Symbol.iterator]()
      while (true) {
        const a = iter1.next()
        const b = iter2.next()
        if (a.done || b.done) break
        yield [a.value, b.value]
      }
    })
  }

  // ─── Lazy Object Operations ──────────────────────────────────────────────────

  select<K extends keyof T>(keys: K | K[]): LazyCollection<Pick<T, K>> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    return this.map((item) => {
      const result = {} as Pick<T, K>
      keyArray.forEach((key) => {
        result[key] = item[key]
      })
      return result
    })
  }

  only(keys: string[]): LazyCollection<Record<string, T[keyof T] | undefined>> {
    return this.map((item) => {
      const copy: Record<string, T[keyof T] | undefined> = {}
      if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, T[keyof T]>
        keys.forEach((key) => {
          copy[key] = key in record ? record[key] : undefined
        })
      }
      return copy
    })
  }

  except<K extends keyof T>(keys: K[]): LazyCollection<Omit<T, K>> {
    return this.map((item) => {
      const copy = { ...item }
      keys.forEach((key) => delete copy[key])
      return copy
    }) as unknown as LazyCollection<Omit<T, K>>
  }

  values(): LazyCollection<T> {
    return new LazyCollection<T>(this.generatorFn)
  }

  keys(): LazyCollection<number> {
    const source = this._iter()
    return new LazyCollection<number>(function* () {
      let i = 0
      for (const _ of source()) {
        void _
        yield i++
      }
    })
  }

  // ─── Lazy Padding & Multiplication ───────────────────────────────────────────

  pad(size: number, value: T): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let count = 0
      const items: T[] = []
      for (const item of source()) {
        items.push(item)
        count++
      }
      if (size < 0) {
        const absSize = Math.abs(size)
        while (count < absSize) {
          yield value
          count++
        }
        yield* items
      } else {
        yield* items
        while (count < size) {
          yield value
          count++
        }
      }
    })
  }

  multiply(count: number): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      const cached: T[] = []
      for (const item of source()) {
        cached.push(item)
        yield item
      }
      for (let i = 1; i < count; i++) {
        yield* cached
      }
    })
  }

  // ─── Lazy Side Effects ───────────────────────────────────────────────────────

  tapEach(callback: (item: T, index: number) => void): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of source()) {
        callback(item, i++)
        yield item
      }
    })
  }

  tap(callback: (collection: LazyCollection<T>) => void): LazyCollection<T> {
    callback(this)
    return this
  }

  // ─── Lazy Timing & Control ───────────────────────────────────────────────────

  takeUntilTimeout(timeout: Date): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      for (const item of source()) {
        if (new Date() >= timeout) break
        yield item
      }
    })
  }

  throttle(_seconds: number): LazyCollection<T> {
    void _seconds
    return new LazyCollection<T>(this.generatorFn)
  }

  remember(): LazyCollection<T> {
    const cache: T[] = []
    let sourceDone = false
    const iter: Iterator<T> = this.generatorFn()
    return new LazyCollection<T>(function* () {
      let i = 0
      while (i < cache.length) {
        yield cache[i++]
      }
      if (!sourceDone) {
        let result = iter.next()
        while (!result.done) {
          cache.push(result.value)
          yield result.value
          result = iter.next()
        }
        sourceDone = true
      }
    })
  }

  withHeartbeat(intervalMs: number, callback: () => void): LazyCollection<T> {
    const source = this._iter()
    return new LazyCollection<T>(function* () {
      let lastBeat = Date.now()
      for (const item of source()) {
        const now = Date.now()
        if (now - lastBeat >= intervalMs) {
          callback()
          lastBeat = now
        }
        yield item
      }
    })
  }

  // ─── Conditional Execution ───────────────────────────────────────────────────

  when(
    condition: boolean | ((collection: LazyCollection<T>) => boolean),
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void,
    fallback?: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    const resolved = typeof condition === 'function' ? condition(this) : condition
    if (resolved) {
      const result = callback(this)
      return result instanceof LazyCollection ? result : this
    } else if (fallback) {
      const result = fallback(this)
      return result instanceof LazyCollection ? result : this
    }
    return this
  }

  whenEmpty(
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void,
    fallback?: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    return this.when(this.isEmpty(), callback, fallback)
  }

  whenNotEmpty(
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void,
    fallback?: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    return this.when(this.isNotEmpty(), callback, fallback)
  }

  unless(
    condition: boolean | ((collection: LazyCollection<T>) => boolean),
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void,
    fallback?: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    const resolved = typeof condition === 'function' ? condition(this) : condition
    return this.when(!resolved, callback, fallback)
  }

  unlessEmpty(
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    return this.whenNotEmpty(callback)
  }

  unlessNotEmpty(
    callback: (collection: LazyCollection<T>) => LazyCollection<T> | void
  ): LazyCollection<T> {
    return this.whenEmpty(callback)
  }

  // ─── Eager Sorting (must collect) ────────────────────────────────────────────

  sort(callback?: (a: T, b: T) => number): LazyCollection<T> {
    const sorted = [...this].sort(callback)
    return new LazyCollection<T>(sorted)
  }

  sortBy<K extends keyof T>(key: K | ((item: T) => unknown)): LazyCollection<T> {
    const sorted = [...this].sort((a, b) => {
      const va = (typeof key === 'function' ? key(a) : a[key]) as string | number
      const vb = (typeof key === 'function' ? key(b) : b[key]) as string | number
      return va < vb ? -1 : va > vb ? 1 : 0
    })
    return new LazyCollection<T>(sorted)
  }

  sortByDesc<K extends keyof T>(key: K | ((item: T) => unknown)): LazyCollection<T> {
    const sorted = [...this].sort((a, b) => {
      const va = (typeof key === 'function' ? key(a) : a[key]) as string | number
      const vb = (typeof key === 'function' ? key(b) : b[key]) as string | number
      return va > vb ? -1 : va < vb ? 1 : 0
    })
    return new LazyCollection<T>(sorted)
  }

  sortDesc(): LazyCollection<T> {
    const sorted = [...this].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))
    return new LazyCollection<T>(sorted)
  }

  sortKeys(): LazyCollection<T> {
    return LazyCollection.fromIterable(this.collect().sortKeys())
  }

  sortKeysDesc(): LazyCollection<T> {
    return LazyCollection.fromIterable(this.collect().sortKeysDesc())
  }

  reverse(): LazyCollection<T> {
    return new LazyCollection<T>([...this].reverse())
  }

  shuffle(): LazyCollection<T> {
    const items = [...this]
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return new LazyCollection<T>(items)
  }

  random(): T | undefined {
    const items = [...this]
    return items[Math.floor(Math.random() * items.length)]
  }

  // ─── Eager Partitioning ──────────────────────────────────────────────────────

  partition(callback: (item: T) => boolean): [LazyCollection<T>, LazyCollection<T>] {
    const truthy: T[] = []
    const falsy: T[] = []
    for (const item of this) {
      if (callback(item)) truthy.push(item)
      else falsy.push(item)
    }
    return [new LazyCollection(truthy), new LazyCollection(falsy)]
  }

  split(numberOfGroups: number): LazyCollection<T[]> {
    const items = [...this]
    if (items.length === 0) return new LazyCollection<T[]>([])
    const size = Math.ceil(items.length / numberOfGroups)
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size))
    }
    return new LazyCollection<T[]>(chunks)
  }

  groupBy(key: keyof T | ((item: T, index: number) => string)): Record<string, T[]> {
    const result: Record<string, T[]> = {}
    let i = 0
    for (const item of this) {
      const groupKey = typeof key === 'function' ? key(item, i++) : String(item[key])
      if (!result[groupKey]) result[groupKey] = []
      result[groupKey].push(item)
    }
    return result
  }

  keyBy(key: keyof T | ((item: T, index: number) => string)): Record<string, T> {
    const result: Record<string, T> = {}
    let i = 0
    for (const item of this) {
      const k = typeof key === 'function' ? key(item, i++) : String(item[key])
      result[k] = item
    }
    return result
  }

  // ─── Piping ──────────────────────────────────────────────────────────────────

  pipe<U>(callback: (collection: LazyCollection<T>) => U): U {
    return callback(this)
  }

  pipeInto<U>(ClassType: new (collection: LazyCollection<T>) => U): U {
    return new ClassType(this)
  }

  pipeThrough(pipes: Array<(value: unknown) => unknown>): unknown {
    return pipes.reduce<unknown>((carry, pipe) => pipe(carry), this)
  }

  // ─── Conversion ──────────────────────────────────────────────────────────────

  collect(): Collection<T> {
    return new Collection<T>([...this])
  }

  lazy(): LazyCollection<T> {
    return this
  }

  toSet(): Set<T> {
    return new Set(this)
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  toJson(): string {
    return JSON.stringify([...this])
  }

  toString(): string {
    return this.toJson()
  }

  // ─── Debugging ───────────────────────────────────────────────────────────────

  dump(): this {
    console.log([...this])
    return this
  }

  dd(): never {
    this.dump()
    throw new Error('Dump and die: LazyCollection debugging terminated.')
  }
}
