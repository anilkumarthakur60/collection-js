import { Collection } from './Collection'
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

  // ─── Iterable Protocol ───────────────────────────────────────────────────────

  *[Symbol.iterator](): Generator<T> {
    yield* this.generatorFn()
  }

  // ─── Eager Terminal Operations ───────────────────────────────────────────────

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

  first(): T | null {
    for (const item of this) return item
    return null
  }

  firstOr<U>(defaultValue: U | (() => U)): T | U {
    for (const item of this) return item
    return typeof defaultValue === 'function' ? (defaultValue as () => U)() : defaultValue
  }

  last(): T | null {
    let last: T | null = null
    for (const item of this) last = item
    return last
  }

  contains(value: T | ((item: T) => boolean)): boolean {
    if (typeof value === 'function') {
      const predicate = value as (item: T) => boolean
      for (const item of this) {
        if (predicate(item)) return true
      }
      return false
    }
    for (const item of this) {
      if (item === value) return true
    }
    return false
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

  isEmpty(): boolean {
    return this.first() === null
  }

  isNotEmpty(): boolean {
    return !this.isEmpty()
  }

  // ─── Eager Aggregation ───────────────────────────────────────────────────────

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

  // ─── Eager Iteration ─────────────────────────────────────────────────────────

  each(callback: (item: T, index: number) => void | false): this {
    let i = 0
    for (const item of this) {
      if (callback(item, i++) === false) break
    }
    return this
  }

  // ─── Lazy Transformation ─────────────────────────────────────────────────────

  map<U>(callback: (item: T, index: number) => U): LazyCollection<U> {
    const self = this
    return new LazyCollection<U>(function* () {
      let i = 0
      for (const item of self) {
        yield callback(item, i++)
      }
    })
  }

  filter(callback: (item: T, index: number) => boolean): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of self) {
        if (callback(item, i++)) yield item
      }
    })
  }

  reject(callback: (item: T, index: number) => boolean): LazyCollection<T> {
    return this.filter((item, index) => !callback(item, index))
  }

  flatMap<U>(callback: (item: T, index: number) => Iterable<U>): LazyCollection<U> {
    const self = this
    return new LazyCollection<U>(function* () {
      let i = 0
      for (const item of self) {
        yield* callback(item, i++)
      }
    })
  }

  chunk(size: number): LazyCollection<T[]> {
    const self = this
    return new LazyCollection<T[]>(function* () {
      let current: T[] = []
      for (const item of self) {
        current.push(item)
        if (current.length >= size) {
          yield current
          current = []
        }
      }
      if (current.length > 0) yield current
    })
  }

  unique(callback?: (item: T) => unknown): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      const seen = new Set<unknown>()
      for (const item of self) {
        const key = callback ? callback(item) : item
        if (!seen.has(key)) {
          seen.add(key)
          yield item
        }
      }
    })
  }

  pluck<K extends keyof T>(key: K): LazyCollection<T[K]> {
    return this.map((item) => item[key])
  }

  values(): LazyCollection<T> {
    return new LazyCollection<T>(this.generatorFn)
  }

  keys(): LazyCollection<number> {
    const self = this
    return new LazyCollection<number>(function* () {
      let i = 0
      for (const _ of self) {
        void _
        yield i++
      }
    })
  }

  take(count: number): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      if (count <= 0) return
      let taken = 0
      for (const item of self) {
        yield item
        if (++taken >= count) break
      }
    })
  }

  takeUntil(callback: T | ((item: T) => boolean)): LazyCollection<T> {
    const self = this
    const predicate =
      typeof callback === 'function'
        ? (callback as (item: T) => boolean)
        : (item: T) => item === callback
    return new LazyCollection<T>(function* () {
      for (const item of self) {
        if (predicate(item)) break
        yield item
      }
    })
  }

  takeWhile(callback: (item: T) => boolean): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      for (const item of self) {
        if (!callback(item)) break
        yield item
      }
    })
  }

  skip(count: number): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      let skipped = 0
      for (const item of self) {
        if (skipped < count) {
          skipped++
          continue
        }
        yield item
      }
    })
  }

  skipUntil(callback: T | ((item: T) => boolean)): LazyCollection<T> {
    const self = this
    const predicate =
      typeof callback === 'function'
        ? (callback as (item: T) => boolean)
        : (item: T) => item === callback
    return new LazyCollection<T>(function* () {
      let skipping = true
      for (const item of self) {
        if (skipping && predicate(item)) skipping = false
        if (!skipping) yield item
      }
    })
  }

  skipWhile(callback: (item: T) => boolean): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      let skipping = true
      for (const item of self) {
        if (skipping && callback(item)) continue
        skipping = false
        yield item
      }
    })
  }

  where<K extends keyof T>(key: K, value: T[K]): LazyCollection<T> {
    return this.filter((item) => item[key] === value)
  }

  whereIn<K extends keyof T>(key: K, values: T[K][]): LazyCollection<T> {
    return this.filter((item) => values.includes(item[key]))
  }

  whereNotNull<K extends keyof T>(key: K): LazyCollection<T> {
    return this.filter((item) => item[key] !== null && item[key] !== undefined)
  }

  concat<U>(items: Iterable<U>): LazyCollection<T | U> {
    const self = this
    return new LazyCollection<T | U>(function* () {
      yield* self
      yield* items
    })
  }

  merge<U>(items: Iterable<U>): LazyCollection<T | U> {
    return this.concat(items)
  }

  zip<U>(values: Iterable<U>): LazyCollection<[T, U]> {
    const self = this
    return new LazyCollection<[T, U]>(function* () {
      const iter1 = self[Symbol.iterator]()
      const iter2 = (values as Iterable<U>)[Symbol.iterator]()
      while (true) {
        const a = iter1.next()
        const b = iter2.next()
        if (a.done || b.done) break
        yield [a.value, b.value]
      }
    })
  }

  // ─── Lazy Side Effects ───────────────────────────────────────────────────────

  tapEach(callback: (item: T, index: number) => void): LazyCollection<T> {
    const self = this
    return new LazyCollection<T>(function* () {
      let i = 0
      for (const item of self) {
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
    const self = this
    return new LazyCollection<T>(function* () {
      for (const item of self) {
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
    const self = this
    return new LazyCollection<T>(function* () {
      let lastBeat = Date.now()
      for (const item of self) {
        const now = Date.now()
        if (now - lastBeat >= intervalMs) {
          callback()
          lastBeat = now
        }
        yield item
      }
    })
  }

  // ─── Piping ──────────────────────────────────────────────────────────────────

  pipe<U>(callback: (collection: LazyCollection<T>) => U): U {
    return callback(this)
  }

  // ─── Conversion ──────────────────────────────────────────────────────────────

  collect(): Collection<T> {
    return new Collection<T>([...this])
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

  groupBy(key: keyof T | ((item: T) => string)): Record<string, T[]> {
    const result: Record<string, T[]> = {}
    for (const item of this) {
      const groupKey =
        typeof key === 'function' ? key(item) : String(item[key])
      if (!result[groupKey]) result[groupKey] = []
      result[groupKey].push(item)
    }
    return result
  }

  keyBy(key: keyof T | ((item: T) => string)): Record<string, T> {
    const result: Record<string, T> = {}
    for (const item of this) {
      const k = typeof key === 'function' ? key(item) : String(item[key])
      result[k] = item
    }
    return result
  }

  // ─── Debugging ───────────────────────────────────────────────────────────────

  dump(): this {
    console.log([...this])
    return this
  }
}
