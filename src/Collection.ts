import { isDeepEqual, deepClone, mergeArrays } from './internals'
import { flattenHelper } from './internals'
import { ItemNotFoundException } from './exceptions'
import { UnexpectedValueException } from './exceptions'
import { LazyCollection } from './LazyCollection'
import type { FlattenType } from './types'
import { all } from './methods/all'
import { after } from './methods/after'
import { before } from './methods/before'
import type { Predicate, PredicateChunkWhile, PredicateContains, Iteratee } from './types'

export class Collection<T> {
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

  // ─── Static Methods ───────────────────────────────────────────────────────────

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

  static wrap<T>(value: T | T[] | Collection<T>): Collection<T> {
    if (value instanceof Collection) return value.collect()
    if (Array.isArray(value)) return new Collection(value)
    return new Collection([value])
  }

  static unwrap<T>(value: T | T[] | Collection<T>): T | T[] {
    if (value instanceof Collection) return value.toArray()
    return value
  }

  // ─── Instance Methods ─────────────────────────────────────────────────────────

  all(predicate?: Predicate<T>): T[] {
    return all(this.items, predicate)
  }

  after(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    return after(this.items, item, strict)
  }

  average(callback?: (item: T) => number): number {
    if (this.items.length === 0) {
      return 0
    }
    if (callback) {
      return this.sum(callback) / this.items.length
    }

    return this.sum((item) => Number(item)) / this.items.length
  }

  avg(callback?: (item: T) => number): number {
    return this.average(callback)
  }

  before(item: T | string | Predicate<T>, strict: boolean = false): T | null {
    return before(this.items, item, strict)
  }

  chunk(size: number): Collection<Collection<T>> {
    if (size <= 0) return new Collection<Collection<T>>([])
    const chunks: Collection<T>[] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(new Collection(this.items.slice(i, i + size)))
    }

    return new Collection(chunks)
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

  collect(): Collection<T> {
    return new Collection(this.items)
  }

  combine<U>(values: readonly (U | undefined)[]): Collection<[T, U | undefined]> {
    const combined: [T, U | undefined][] = []
    for (let i = 0; i < this.items.length; i++) {
      combined.push([this.items[i], values[i]])
    }
    return new Collection(combined)
  }

  concat<U>(items: U[] | Collection<U>): Collection<T | U> {
    const newItems = items instanceof Collection ? items.all() : items
    return new Collection((this.items as (T | U)[]).concat(newItems))
  }

  contains(value: T | PredicateContains<T> | Partial<T>): boolean {
    if (typeof value === 'function') {
      return this.items.some(value as Predicate<T>)
    }

    if (typeof value === 'object' && value !== null) {
      return this.items.some((item) =>
        Object.keys(value as Record<string, unknown>).every(
          (key) =>
            (item as Record<string, unknown>)[key] ===
            (value as Record<string, unknown>)[key]
        )
      )
    }

    return this.items.includes(value as T)
  }

  containsOneItem(callback?: PredicateContains<T>): boolean {
    if (callback) {
      return this.items.filter(callback).length === 1
    }
    return this.items.length === 1
  }

  containsStrict(value: T): boolean {
    return this.items.includes(value)
  }

  count(): number {
    return this.items.length
  }

  countBy(iteratee?: Iteratee<T>): Record<string, number> {
    if (!iteratee) {
      return this.items.reduce((acc: Record<string, number>, item: T) => {
        const key = String(item)
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
    }
    return this.items.reduce((acc: Record<string, number>, item: T) => {
      const key = String(iteratee(item))
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  crossJoin<U>(...arrays: U[][]): Collection<(T | U)[]> {
    const result: (T | U)[][] = []

    const helper = (current: (T | U)[], depth: number): void => {
      if (depth === arrays.length) {
        result.push(current)
        return
      }

      for (const value of arrays[depth]) {
        helper([...current, value], depth + 1)
      }
    }

    for (const item of this.items) {
      helper([item], 0)
    }

    return new Collection<(T | U)[]>(result)
  }

  dd(): void {
    this.dump()
    if (typeof process !== 'undefined') {
      process.exit(1)
    }
  }

  diff(other: T[] | Collection<T>): Collection<T> {
    const otherItems = other instanceof Collection ? other.items : other
    const uniqueItems = this.items.filter(
      (item) => !otherItems.some((otherItem) => this.isEqual(item, otherItem))
    )
    return new Collection(uniqueItems)
  }

  protected getArrayableItems(items: Collection<T> | T[]): T[] {
    if (items instanceof Collection) {
      return items.all()
    }
    return items
  }

  isEqual(value: T, other: T): boolean {
    return isDeepEqual(value, other)
  }

  diffAssoc(values: Collection<T> | T[]): Collection<T> {
    const arrayableValues = this.getArrayableItems(values)
    const diffItems = this.items.filter(
      (item) => !arrayableValues.some((value) => this.isEqual(item, value))
    )
    return new Collection(diffItems)
  }

  diffAssocUsing(values: T[], callback: (item: T) => unknown): Collection<T> {
    const diffItems = this.items.filter(
      (item) => !values.some((value) => callback(value) === callback(item))
    )
    return new Collection(diffItems)
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

    const diffItems = this.items.filter(
      (item) => !Object.keys(item as Record<string, T>).some((key) => otherItems[key])
    )

    return new Collection(diffItems)
  }

  doesntContain(value: T | PredicateContains<T> | Partial<T>): boolean {
    return !this.contains(value)
  }

  doesntContainStrict(value: T): boolean {
    return !this.containsStrict(value)
  }

  dot(): Record<string, unknown> {
    const flatten = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
      return Object.keys(obj).reduce(
        (acc, k) => {
          const pre = prefix.length ? prefix + '.' : ''
          if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flatten(obj[k] as Record<string, unknown>, pre + k))
          } else {
            acc[pre + k] = obj[k]
          }
          return acc
        },
        {} as Record<string, unknown>
      )
    }

    return this.items.reduce(
      (acc, item) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flatten(item as Record<string, unknown>))
        }
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  dump(): T[] {
    console.log(this.items)
    return this.items
  }

  duplicates(key?: keyof T): Collection<T> {
    const seen = new Map<T[keyof T] | T, T>()
    const duplicates = new Set<T[keyof T] | T>()
    const result: T[] = []

    this.items.forEach((item) => {
      const value = key ? item[key] : item

      if (seen.has(value)) {
        if (!duplicates.has(value)) {
          duplicates.add(value)
          const original = seen.get(value)
          if (original) result.push(original)
        }
      } else {
        seen.set(value, item)
      }
    })

    return new Collection(result)
  }

  duplicatesStrict(key?: keyof T): Collection<T> {
    const seen = new Map<T[keyof T], T[]>()
    const result: T[] = []

    this.items.forEach((item) => {
      const value = key ? item[key] : item

      if (seen.has(value as T[keyof T])) {
        seen.get(value as T[keyof T])!.push(item)
      } else {
        seen.set(value as T[keyof T], [item])
      }
    })

    seen.forEach((items) => {
      if (items.length > 1) {
        result.push(...items)
      }
    })

    return new Collection(result)
  }

  each(callback: (item: T, index: number) => void | boolean): this {
    for (let i = 0; i < this.items.length; i++) {
      if (callback(this.items[i], i) === false) break
    }
    return this
  }

  eachSpread(callback: (...args: T extends (infer R)[] ? R[] : T[]) => void | boolean): this {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      const args = Array.isArray(item) ? item : [item]
      const result = callback(...(args as T extends (infer R)[] ? R[] : T[]))
      if (result === false) {
        break
      }
    }
    return this
  }

  ensure(...types: Array<{ new (...args: T[]): T } | string>): this {
    for (const item of this.items) {
      const isValid = types.some((type) => {
        if (typeof type === 'string') {
          return typeof item === type
        }
        return item instanceof type
      })
      if (!isValid) {
        throw new UnexpectedValueException(`Item ${String(item)} is not of the expected type(s)`)
      }
    }
    return this
  }

  every(callback: (item: T, index: number) => boolean): boolean {
    return this.items.every(callback)
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

  filter(callback?: (item: T, index: number, array: T[]) => boolean): Collection<T> {
    if (!callback) {
      return new Collection(this.items.filter(Boolean))
    }
    return new Collection(this.items.filter(callback))
  }

  first(predicate?: (item: T, index: number) => boolean): T | null {
    if (predicate) {
      for (let i = 0; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i]
        }
      }
      return null
    }
    return this.items.length > 0 ? this.items[0] : null
  }

  firstOrFail(predicate?: (item: T, index: number) => boolean): T {
    if (predicate) {
      for (let i = 0; i < this.items.length; i++) {
        if (predicate(this.items[i], i)) {
          return this.items[i]
        }
      }
      throw new ItemNotFoundException('No items found that match the predicate')
    }
    if (this.items.length > 0) {
      return this.items[0]
    }
    throw new ItemNotFoundException('No items found in the collection')
  }

  firstWhere<K extends keyof T>(key: K, value?: T[K], operator: string = '==='): T | null {
    if (arguments.length === 1) {
      for (const item of this.items) {
        if (item[key]) {
          return item
        }
      }
    } else {
      for (const item of this.items) {
        if (value !== undefined && value !== null) {
          switch (operator) {
            case '===':
              if (item[key] === value) return item
              break
            case '!==':
              if (item[key] !== value) return item
              break
            case '<':
              if (item[key] < value) return item
              break
            case '<=':
              if (item[key] <= value) return item
              break
            case '>':
              if (item[key] > value) return item
              break
            case '>=':
              if (item[key] >= value) return item
              break
          }
        }
      }
    }
    return null
  }

  flatMap<U>(callback: (item: T) => U[]): Collection<U> {
    const mapped = this.items.map(callback)
    const flattened = ([] as U[]).concat(...mapped)
    return new Collection(flattened)
  }

  flatten(depth: number = Infinity): Collection<FlattenType<T>> {
    const flattenedItems = flattenHelper(this.items, depth) as FlattenType<T>[]
    return new Collection<FlattenType<T>>(flattenedItems)
  }

  flip(): Collection<Record<string, number>> {
    const flippedItems: Record<string, number> = {}
    this.items.forEach((value, index) => {
      if (typeof value === 'string' || typeof value === 'number') {
        flippedItems[String(value)] = index
      } else {
        throw new Error('Collection items must be of type string or number to flip.')
      }
    })
    return new Collection([flippedItems])
  }

  forget(index: number | string | (number | string)[]): Collection<T> {
    if (Array.isArray(index)) {
      const indices = index
      if (typeof indices[0] === 'number') {
        const numIndices = indices as number[]
        return new Collection(this.items.filter((_, i) => !numIndices.includes(i)))
      } else {
        const strKeys = indices as string[]
        return new Collection(
          this.items.map((item) => {
            const itemCopy = { ...item } as Record<string, unknown>
            strKeys.forEach((k) => delete itemCopy[k])
            return itemCopy as T
          })
        )
      }
    }

    if (typeof index === 'number') {
      if (index < 0 || index >= this.items.length) {
        return new Collection(this.items)
      }
      const newItems = this.items.slice(0, index).concat(this.items.slice(index + 1))
      return new Collection(newItems)
    } else if (typeof index === 'string') {
      return new Collection(
        this.items.map((item) => {
          const itemCopy = { ...item } as Record<string, unknown>
          delete itemCopy[index]
          return itemCopy as T
        })
      )
    }
    return new Collection(this.items)
  }

  forPage(page: number, perPage: number): Collection<T> {
    return new Collection(this.items.slice((page - 1) * perPage, page * perPage))
  }

  get(index: number): T | undefined
  get(index: number, defaultValue: T): T
  get(index: number, defaultValue: () => T): T
  get(index: number, defaultValue?: T | (() => T)): T | undefined {
    if (index >= 0 && index < this.items.length) {
      return this.items[index]
    }
    if (defaultValue !== undefined) {
      return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
    }
    return undefined
  }

  groupBy<K extends keyof T>(
    key: K | ((item: T, index: number) => string)
  ): Record<string, T[]> {
    if (typeof key === 'function') {
      return this.items.reduce(
        (result, item, index) => {
          const groupKey = key(item, index)
          if (!result[groupKey]) {
            result[groupKey] = []
          }
          result[groupKey].push(item)
          return result
        },
        {} as Record<string, T[]>
      )
    }
    return this.items.reduce(
      (result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
          result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
      },
      {} as Record<string, T[]>
    )
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
    if (callback) {
      return this.items.filter(callback).length > 1
    }
    return this.items.length > 1
  }

  hasSole(callback?: (item: T) => boolean): boolean {
    if (callback) {
      return this.items.filter(callback).length === 1
    }
    return this.items.length === 1
  }

  implode(glue: string | ((item: T, index: number) => string), key?: keyof T): string {
    if (typeof glue === 'function') {
      return this.items.map(glue).join(key ? String(key) : '')
    }
    if (key !== undefined) {
      return this.items.map((item) => String(item[key])).join(glue)
    }
    return this.items.map(String).join(glue)
  }

  intersect(values: T[]): Collection<T> {
    const intersectItems = this.items.filter((item) => values.includes(item))
    return new Collection(intersectItems)
  }

  intersectUsing(values: T[], callback: (a: T, b: T) => number): Collection<T> {
    return new Collection(
      this.items.filter((item) => values.some((value) => callback(item, value) === 0))
    )
  }

  intersectAssoc(values: T[]): Collection<T> {
    const intersectItems = this.items.filter((item) => values.includes(item))
    return new Collection(intersectItems)
  }

  intersectAssocUsing(
    values: Record<string, unknown>,
    callback: (a: string, b: string) => number
  ): Collection<Record<string, unknown>> {
    const merged: Record<string, unknown> = {}
    for (const item of this.items) {
      if (typeof item === 'object' && item !== null) {
        Object.assign(merged, item)
      }
    }

    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(merged)) {
      for (const [vKey, vValue] of Object.entries(values)) {
        if (callback(key, vKey) === 0 && value === vValue) {
          result[key] = value
        }
      }
    }
    return new Collection([result])
  }

  intersectByKeys<K extends keyof T>(keys: K[]): Collection<T> {
    const intersectItems = this.items.filter((item) => keys.includes(item as unknown as K))
    return new Collection(intersectItems)
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isNotEmpty(): boolean {
    return this.items.length > 0
  }

  join(separator: string, finalSeparator?: string): string {
    if (!finalSeparator) {
      return this.items.map(String).join(separator)
    }
    if (this.items.length === 0) return ''
    if (this.items.length === 1) return String(this.items[0])
    const init = this.items.slice(0, -1).map(String).join(separator)
    return init + finalSeparator + String(this.items[this.items.length - 1])
  }

  keyBy<K extends keyof T>(
    key: K | ((item: T, index: number) => string)
  ): Record<string, T> {
    if (typeof key === 'function') {
      return this.items.reduce(
        (result, item, index) => {
          result[key(item, index)] = item
          return result
        },
        {} as Record<string, T>
      )
    }
    return this.items.reduce(
      (result, item) => {
        result[String(item[key])] = item
        return result
      },
      {} as Record<string, T>
    )
  }

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
    } else if (typeof this.items === 'object' && this.items !== null) {
      return Object.keys(this.items) as (keyof T)[]
    }
    return this.items.map((_, index) => index.toString())
  }

  last(
    predicate?: (item: T, index: number) => boolean,
    errorFn?: () => void
  ): T | undefined {
    if (!predicate) {
      return this.items[this.items.length - 1]
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      if (predicate(this.items[i], i)) {
        return this.items[i]
      }
    }

    if (errorFn) {
      errorFn()
    }

    return undefined
  }

  lazy(): LazyCollection<T> {
    return new LazyCollection<T>(this.items)
  }

  make<U>(callback: (item: T, index: number, array: T[]) => U): Collection<U> {
    return new Collection(this.items.map(callback))
  }

  map<U>(callback: (item: T, index: number) => U): Collection<U> {
    return new Collection(this.items.map((item, index) => callback(item, index)))
  }

  mapInto<U>(ClassType: new (item: T) => U): Collection<U> {
    try {
      return new Collection(this.items.map((item) => new ClassType(item)))
    } catch (error) {
      throw new Error(`${ClassType.name} is not a valid constructor for the provided items.`)
    }
  }

  mapSpread<U>(callback: (...args: T extends (infer I)[] ? I[] : never) => U): Collection<U> {
    return new Collection(
      this.items.map((item) => callback(...(item as T extends (infer I)[] ? I[] : never)))
    )
  }

  mapToGroups<K extends string, V>(
    callback: (item: T, index: number) => [K, V]
  ): Record<K, V[]> {
    return this.items.reduce<Record<K, V[]>>(
      (result, item, index) => {
        const [key, value] = callback(item, index)
        if (!result[key]) {
          result[key] = []
        }
        result[key].push(value)
        return result
      },
      {} as Record<K, V[]>
    )
  }

  mapWithKeys<K extends string, V>(
    callback: (item: T, index: number) => [K, V]
  ): Record<K, V> {
    const result = {} as Record<K, V>
    this.items.forEach((item, index) => {
      const [key, value] = callback(item, index)
      result[key] = value
    })
    return result
  }

  max(callback?: ((item: T) => number) | keyof T): number {
    if (typeof callback === 'function') {
      return Math.max(...this.items.map(callback))
    }
    if (callback !== undefined) {
      return Math.max(...this.items.map((item) => Number(item[callback])))
    }
    return Math.max(...this.items.map((item) => Number(item)))
  }

  median(callback?: (item: T) => number): number {
    const sorted = callback
      ? this.items.map(callback).sort((a, b) => a - b)
      : [...this.items].sort((a, b) => Number(a) - Number(b))
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (Number(sorted[middle - 1]) + Number(sorted[middle])) / 2
      : Number(sorted[middle])
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
      (acc, current) => {
        return mergeArrays(acc, current)
      },
      target as (T | U)[]
    )

    return new Collection(mergedArray)
  }

  min(callback?: ((item: T) => number) | keyof T): T | number | undefined {
    if (this.items.length === 0) {
      return undefined
    }

    if (typeof callback === 'function') {
      let minItem: T | undefined = undefined
      let minValue = Infinity

      for (const item of this.items) {
        const value = callback(item)
        if (value < minValue) {
          minValue = value
          minItem = item
        }
      }

      return minItem
    }

    if (callback !== undefined) {
      return Math.min(...this.items.map((item) => Number(item[callback])))
    }

    let minItem = this.items[0]
    const rest = this.items.slice(1)

    for (const item of rest) {
      if (
        (typeof item === 'number' || typeof item === 'string') &&
        (typeof minItem === 'number' || typeof minItem === 'string')
      ) {
        if (item < minItem) {
          minItem = item
        }
      } else {
        throw new Error('Items must be number or string if no callback is provided to min().')
      }
    }

    return minItem
  }

  mode(callback?: (item: T) => unknown): T | T[] | undefined {
    if (this.items.length === 0) {
      return undefined
    }

    const counts = new Map<string, { count: number; item: T }>()

    for (const item of this.items) {
      const keyValue = callback ? callback(item) : item
      let mapKey: string

      if (typeof keyValue === 'object' && keyValue !== null) {
        mapKey = JSON.stringify(keyValue)
      } else {
        mapKey = String(keyValue)
      }

      const entry = counts.get(mapKey)
      if (entry) {
        entry.count++
      } else {
        counts.set(mapKey, { count: 1, item })
      }
    }

    let maxCount = -Infinity
    for (const { count } of counts.values()) {
      if (count > maxCount) {
        maxCount = count
      }
    }

    const modeItems: T[] = []
    for (const { count, item } of counts.values()) {
      if (count === maxCount) {
        modeItems.push(item)
      }
    }

    return modeItems.length === 1 ? modeItems[0] : modeItems
  }

  multiply(count: number): Collection<T> {
    const result: T[] = []
    for (let i = 0; i < count; i++) {
      result.push(...this.items)
    }
    return new Collection(result)
  }

  nth(n: number, offset: number = 0): Collection<T> {
    const result: T[] = []
    for (let i = offset; i < this.items.length; i += n) {
      result.push(this.items[i])
    }
    return new Collection(result)
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

  pad(size: number, value: T): Collection<T> {
    const newItems = [...this.items]
    if (size < 0) {
      const absSize = Math.abs(size)
      while (newItems.length < absSize) {
        newItems.unshift(value)
      }
    } else {
      while (newItems.length < size) {
        newItems.push(value)
      }
    }
    return new Collection(newItems)
  }

  partition(callback: (item: T) => boolean): [Collection<T>, Collection<T>] {
    const [truthy, falsy] = this.items.reduce(
      ([trueArr, falseArr], item) => {
        if (callback(item)) {
          trueArr.push(item)
        } else {
          falseArr.push(item)
        }
        return [trueArr, falseArr]
      },
      [[], []] as [T[], T[]]
    )
    return [new Collection(truthy), new Collection(falsy)]
  }

  percentage(callback: (item: T) => boolean, precision: number = 2): number {
    if (this.items.length === 0) return 0
    const count = this.items.filter(callback).length
    const result = (count / this.items.length) * 100
    return parseFloat(result.toFixed(precision))
  }

  pipe<U>(callback: (collection: Collection<T>) => U): U {
    return callback(this)
  }

  pipeInto<U>(ClassType: new (collection: Collection<T>) => U): U {
    return new ClassType(this)
  }

  pipeThrough(pipes: Array<(value: unknown) => unknown>): unknown {
    return pipes.reduce<unknown>((carry, pipe) => pipe(carry), this)
  }

  pluck<K extends keyof T>(key: K): Collection<T[K]>
  pluck<K extends keyof T, J extends keyof T>(key: K, keyBy: J): Record<string, T[K]>
  pluck<K extends keyof T, J extends keyof T>(
    key: K,
    keyBy?: J
  ): Collection<T[K]> | Record<string, T[K]> {
    if (keyBy !== undefined) {
      const result: Record<string, T[K]> = {}
      this.items.forEach((item) => {
        result[String(item[keyBy])] = item[key]
      })
      return result
    }
    return new Collection(this.items.map((item) => item[key]))
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

  prepend(value: T): Collection<T> {
    return new Collection([value, ...this.items])
  }

  pull(value: T): Collection<T> {
    return new Collection(this.items.filter((item) => item !== value))
  }

  push(...values: T[]): Collection<T> {
    this.items.push(...values)
    return this
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

  range(start: number, end: number): Collection<number> {
    return new Collection([...Array(end - start + 1).keys()].map((i) => i + start))
  }

  reduce<U>(callback: (accumulator: U, item: T, index: number) => U, initialValue: U): U
  reduce(callback: (accumulator: T, item: T, index: number) => T): T
  reduce<U>(
    callback: (accumulator: U | T, item: T, index: number) => U | T,
    initialValue?: U
  ): U | T {
    if (initialValue !== undefined) {
      return this.items.reduce(
        callback as (acc: U, item: T, index: number) => U,
        initialValue
      )
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

  reject(callback: (item: T, index?: number) => boolean): Collection<T> {
    return new Collection(this.items.filter((item, index) => !callback(item, index)))
  }

  replace(search: T, replace: T): Collection<T> {
    return new Collection(this.items.map((item) => (item === search ? replace : item)))
  }

  replaceRecursive(search: T, replace: T): Collection<T> {
    return new Collection(this.items.map((item) => (item === search ? replace : item)))
  }

  reverse(): Collection<T> {
    return new Collection([...this.items].reverse())
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

  shift(): T | undefined
  shift(count: number): Collection<T>
  shift(count?: number): T | undefined | Collection<T> {
    if (count !== undefined) {
      const shifted = this.items.splice(0, count)
      return new Collection(shifted)
    }
    return this.items.shift()
  }

  shuffle(): Collection<T> {
    const shuffled = [...this.items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return new Collection(shuffled)
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
    if (length !== undefined) {
      return new Collection(this.items.slice(start, start + length))
    }
    return new Collection(this.items.slice(start))
  }

  sliding(size: number, step: number = 1): Collection<T[]> {
    const chunks: T[][] = []
    for (let i = 0; i <= this.items.length - size; i += step) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  sole(key?: keyof T | ((item: T, index: number) => boolean), value?: T[keyof T]): T {
    if (key === undefined) {
      if (this.items.length !== 1) {
        throw new Error(
          this.items.length === 0
            ? 'No items found in the collection'
            : 'Multiple items found in the collection'
        )
      }
      return this.items[0]
    }

    let matches: T[]

    if (typeof key === 'function') {
      matches = this.items.filter(key)
    } else if (value !== undefined) {
      matches = this.items.filter((item) => item[key] === value)
    } else {
      matches = this.items.filter((item) => item[key])
    }

    if (matches.length === 0) throw new ItemNotFoundException('No items match the given criteria')
    if (matches.length > 1) throw new Error('Multiple items match the given criteria')
    return matches[0]
  }

  some(callback: (item: T) => boolean): boolean {
    return this.items.some(callback)
  }

  sort(callback?: (a: T, b: T) => number): Collection<T> {
    if (callback) {
      return new Collection([...this.items].sort(callback))
    }
    return new Collection(
      [...this.items].sort((a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
    )
  }

  sortBy<K extends keyof T>(
    key:
      | K
      | ((item: T, index: number) => unknown)
      | Array<[K, 'asc' | 'desc'] | ((a: T, b: T) => number)>
  ): Collection<T> {
    if (Array.isArray(key)) {
      const sortOps = key as Array<[K, 'asc' | 'desc'] | ((a: T, b: T) => number)>
      return new Collection(
        [...this.items].sort((a, b) => {
          for (const op of sortOps) {
            if (typeof op === 'function') {
              const result = op(a, b)
              if (result !== 0) return result
            } else {
              const [sortKey, direction] = op
              const aVal = a[sortKey]
              const bVal = b[sortKey]
              const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
              if (cmp !== 0) return direction === 'desc' ? -cmp : cmp
            }
          }
          return 0
        })
      )
    }

    if (typeof key === 'function') {
      const fn = key as (item: T, index: number) => unknown
      return new Collection(
        [...this.items].sort((a, b) => {
          const aVal = fn(a, 0) as string | number
          const bVal = fn(b, 0) as string | number
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        })
      )
    }

    return new Collection([...this.items].sort((a, b) => (a[key] > b[key] ? 1 : -1)))
  }

  sortByDesc<K extends keyof T>(
    key: K | ((item: T, index: number) => unknown)
  ): Collection<T> {
    if (typeof key === 'function') {
      const fn = key as (item: T, index: number) => unknown
      return new Collection(
        [...this.items].sort((a, b) => {
          const aVal = fn(a, 0) as string | number
          const bVal = fn(b, 0) as string | number
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        })
      )
    }
    return new Collection([...this.items].sort((a, b) => (a[key] > b[key] ? -1 : 1)))
  }

  sortDesc(): Collection<T> {
    return new Collection(
      [...this.items].sort((a, b) => {
        if (a > b) return -1
        if (a < b) return 1
        return 0
      })
    )
  }

  sortKeys(): Collection<T> {
    return new Collection(
      this.items.map((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const sorted = Object.keys(item as Record<string, unknown>)
            .sort()
            .reduce(
              (acc, k) => {
                acc[k] = (item as Record<string, unknown>)[k]
                return acc
              },
              {} as Record<string, unknown>
            )
          return sorted as unknown as T
        }
        return item
      })
    )
  }

  sortKeysDesc(): Collection<T> {
    return new Collection(
      this.items.map((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const sorted = Object.keys(item as Record<string, unknown>)
            .sort()
            .reverse()
            .reduce(
              (acc, k) => {
                acc[k] = (item as Record<string, unknown>)[k]
                return acc
              },
              {} as Record<string, unknown>
            )
          return sorted as unknown as T
        }
        return item
      })
    )
  }

  sortKeysUsing(callback: (a: string, b: string) => number): Collection<T> {
    return new Collection(
      this.items.map((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const sorted = Object.keys(item as Record<string, unknown>)
            .sort(callback)
            .reduce(
              (acc, k) => {
                acc[k] = (item as Record<string, unknown>)[k]
                return acc
              },
              {} as Record<string, unknown>
            )
          return sorted as unknown as T
        }
        return item
      })
    )
  }

  splice(start: number, deleteCount?: number, ...values: T[]): Collection<T> {
    const copy = [...this.items]
    if (deleteCount !== undefined) {
      copy.splice(start, deleteCount, ...values)
    } else {
      copy.splice(start)
    }
    return new Collection(copy)
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
    if (this.items.length === 0) return new Collection<T[]>([])
    const size = Math.ceil(this.items.length / numberOfGroups)
    const chunks: T[][] = []
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(this.items.slice(i, i + size))
    }
    return new Collection(chunks)
  }

  sum(callback?: ((item: T) => number) | keyof T): number {
    if (!callback) {
      return this.items.reduce((acc, item) => acc + Number(item), 0)
    }
    if (typeof callback === 'function') {
      return this.items.reduce((acc, item) => acc + callback(item), 0)
    }
    return this.items.reduce((acc, item) => acc + Number(item[callback]), 0)
  }

  take(count: number): Collection<T> {
    if (count < 0) {
      return new Collection(this.items.slice(count))
    }
    return new Collection(this.items.slice(0, count))
  }

  takeUntil(callback: T | ((item: T, index: number) => boolean)): Collection<T> {
    if (typeof callback === 'function') {
      const fn = callback as (item: T, index: number) => boolean
      const index = this.items.findIndex(fn)
      return index === -1
        ? new Collection(this.items)
        : new Collection(this.items.slice(0, index))
    }
    const index = this.items.indexOf(callback as T)
    return index === -1
      ? new Collection(this.items)
      : new Collection(this.items.slice(0, index))
  }

  takeWhile(callback: (item: T, index: number) => boolean): Collection<T> {
    const index = this.items.findIndex((item, i) => !callback(item, i))
    return index === -1 ? new Collection(this.items) : new Collection(this.items.slice(0, index))
  }

  tap(callback: (collection: Collection<T>) => void): Collection<T> {
    callback(this)
    return this
  }

  times(count: number): Collection<T> {
    return new Collection([...Array(count)].map(() => this.items).flat())
  }

  toArray(): T[] {
    return this.items
  }

  toJson(): string {
    return JSON.stringify(this.items)
  }

  toPrettyJson(): string {
    return JSON.stringify(this.items, null, 2)
  }

  transform(callback: (item: T, index: number) => T): this {
    this.items = this.items.map(callback)
    return this
  }

  undot(): Collection<Record<string, unknown>> {
    const expandDot = (obj: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        const parts = key.split('.')
        let current = result
        for (let i = 0; i < parts.length - 1; i++) {
          if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {}
          }
          current = current[parts[i]] as Record<string, unknown>
        }
        current[parts[parts.length - 1]] = value
      }
      return result
    }

    const merged: Record<string, unknown> = {}
    for (const item of this.items) {
      if (typeof item === 'object' && item !== null) {
        Object.assign(merged, item)
      }
    }

    return new Collection([expandDot(merged)])
  }

  union(values: T[]): Collection<T> {
    const unionItems = [...this.items]
    for (const value of values) {
      const exists = unionItems.some((item) => this.isEqual(item, value))
      if (!exists) {
        unionItems.push(value)
      }
    }
    return new Collection(unionItems)
  }

  unique(callback?: ((item: T) => unknown) | keyof T): Collection<T> {
    if (typeof callback === 'function') {
      return new Collection(
        this.items.filter(
          (item, index, self) => self.findIndex((i) => callback(i) === callback(item)) === index
        )
      )
    }
    if (callback !== undefined) {
      const key = callback as keyof T
      return new Collection(
        this.items.filter(
          (item, index, self) => self.findIndex((i) => i[key] === item[key]) === index
        )
      )
    }
    return new Collection(Array.from(new Set(this.items)))
  }

  uniqueStrict(): Collection<T> {
    return new Collection([...new Set(this.items)])
  }

  unless(
    condition: boolean,
    callback: (collection: Collection<T>, value: boolean) => void,
    fallback?: (collection: Collection<T>, value: boolean) => void
  ): Collection<T> {
    if (!condition) {
      callback(this, condition)
    } else if (fallback) {
      fallback(this, condition)
    }
    return this
  }

  unlessEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length > 0) {
      callback(this)
    }
    return this
  }

  unlessNotEmpty(callback: (collection: Collection<T>) => void): Collection<T> {
    if (this.items.length === 0) {
      callback(this)
    }
    return this
  }

  unwrap(): T | T[] {
    return this.items.length === 1 ? this.items[0] : this.items
  }

  value<K extends keyof T>(key?: K): T | T[K] | undefined {
    if (key !== undefined) {
      return this.items.length > 0 ? this.items[0][key] : undefined
    }
    return this.items[0]
  }

  values(): Collection<T> {
    return new Collection([...this.items])
  }

  when(
    condition: boolean,
    callback: (collection: Collection<T>, value: boolean) => void,
    fallback?: (collection: Collection<T>, value: boolean) => void
  ): Collection<T> {
    if (condition) {
      callback(this, condition)
    } else if (fallback) {
      fallback(this, condition)
    }
    return this
  }

  whenEmpty(
    callback: (collection: Collection<T>) => void,
    fallback?: (collection: Collection<T>) => void
  ): Collection<T> {
    if (this.items.length === 0) {
      callback(this)
    } else if (fallback) {
      fallback(this)
    }
    return this
  }

  whenNotEmpty(
    callback: (collection: Collection<T>) => void,
    fallback?: (collection: Collection<T>) => void
  ): Collection<T> {
    if (this.items.length > 0) {
      callback(this)
    } else if (fallback) {
      fallback(this)
    }
    return this
  }

  where<K extends keyof T>(key: K, value: T[K]): Collection<T>
  where<K extends keyof T>(key: K, operator: string, value: T[K]): Collection<T>
  where<K extends keyof T>(
    key: K,
    operatorOrValue: string | T[K],
    value?: T[K]
  ): Collection<T> {
    if (value === undefined) {
      return new Collection(this.items.filter((item) => item[key] === operatorOrValue))
    }
    const operator = operatorOrValue as string
    return new Collection(
      this.items.filter((item) => {
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
    )
  }

  whereStrict<K extends keyof T>(key: K, value: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] === value))
  }

  whereBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] >= min && item[key] <= max))
  }

  whereIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => values.includes(item[key])))
  }

  whereInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => values.includes(item[key])))
  }

  whereInstanceOf<U extends object>(
    classType: abstract new (...args: ReadonlyArray<unknown>) => U
  ): Collection<U> {
    const ctor = classType as new (...args: unknown[]) => U
    // Cast needed: T is not known to extend U, but we filter by instanceof at runtime
    return new Collection(
      (this.items as unknown as U[]).filter((item) => item instanceof ctor)
    )
  }

  whereNotBetween<K extends keyof T>(key: K, min: T[K], max: T[K]): Collection<T> {
    return new Collection(this.items.filter((item) => item[key] < min || item[key] > max))
  }

  whereNotIn<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => !values.includes(item[key])))
  }

  whereNotInStrict<K extends keyof T>(key: K, values: T[K][]): Collection<T> {
    return new Collection(this.items.filter((item) => !values.includes(item[key])))
  }

  whereNotNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(
      this.items.filter((item) => item[key] !== null && item[key] !== undefined)
    )
  }

  whereNull<K extends keyof T>(key: K): Collection<T> {
    return new Collection(
      this.items.filter((item) => item[key] === null || item[key] === undefined)
    )
  }

  wrap(): Collection<T[]> {
    return new Collection([this.items])
  }

  zip<U>(values: U[]): Collection<[T, U]> {
    const zipped: [T, U][] = []
    for (let i = 0; i < this.items.length; i++) {
      zipped.push([this.items[i], values[i]])
    }
    return new Collection(zipped)
  }
}

