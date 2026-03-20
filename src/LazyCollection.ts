import type { ILazyCollection } from './types'

export class LazyCollection<T> implements ILazyCollection<T> {
  private readonly generatorFn: () => Generator<T>

  constructor(source: T[] | (() => Generator<T>)) {
    if (typeof source === 'function') {
      this.generatorFn = source
    } else {
      const items = source
      this.generatorFn = function* () {
        yield* items
      }
    }
  }

  *[Symbol.iterator](): Generator<T> {
    yield* this.generatorFn()
  }

  all(): T[] {
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

  toArray(): T[] {
    return [...this]
  }

  each(callback: (item: T, index: number) => void | false): this {
    let i = 0
    for (const item of this) {
      if (callback(item, i++) === false) break
    }
    return this
  }

  map<U>(callback: (item: T, index: number) => U): LazyCollection<U> {
    return new LazyCollection<U>(() => this._mapGen(callback))
  }

  filter(callback: (item: T, index: number) => boolean): LazyCollection<T> {
    return new LazyCollection<T>(() => this._filterGen(callback))
  }

  take(count: number): LazyCollection<T> {
    return new LazyCollection<T>(() => this._takeGen(count))
  }

  skip(count: number): LazyCollection<T> {
    return new LazyCollection<T>(() => this._skipGen(count))
  }

  where<K extends keyof T>(key: K, value: T[K]): LazyCollection<T> {
    return this.filter((item) => item[key] === value)
  }

  /**
   * While `each` calls the callback immediately for every item,
   * `tapEach` applies the callback lazily as items are pulled from the collection.
   */
  tapEach(callback: (item: T, index: number) => void): LazyCollection<T> {
    return new LazyCollection<T>(() => this._tapEachGen(callback))
  }

  /**
   * Takes items from the collection until the given timeout `Date` is reached.
   * Once the current wall-clock time is at or past the timeout, enumeration stops.
   */
  takeUntilTimeout(timeout: Date): LazyCollection<T> {
    return new LazyCollection<T>(() => this._takeUntilTimeoutGen(timeout))
  }

  /**
   * Throttles the collection such that each value is returned after the specified
   * number of seconds. In a synchronous JS runtime real sleep is not possible,
   * so this method is a transparent pass-through that preserves lazy semantics.
   * For async throttling pair this with an async generator pipeline.
   */
  throttle(_seconds: number): LazyCollection<T> {
    void _seconds
    return new LazyCollection<T>(this.generatorFn)
  }

  /**
   * Returns a new lazy collection that caches every item on first enumeration.
   * Subsequent iterations yield cached items first, then continue pulling from
   * the shared source iterator — so the source is never re-evaluated.
   */
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

  /**
   * Calls `callback` at regular `intervalMs` millisecond intervals while
   * items are being enumerated. Useful for extending locks, emitting progress
   * updates, or other periodic maintenance during long-running iterations.
   *
   * @param intervalMs - Milliseconds between heartbeat calls
   * @param callback   - Function called each time the interval elapses
   */
  withHeartbeat(intervalMs: number, callback: () => void): LazyCollection<T> {
    return new LazyCollection<T>(() => this._withHeartbeatGen(intervalMs, callback))
  }

  collect(): Collection<T> {
    return new Collection<T>([...this])
  }

  private *_mapGen<U>(callback: (item: T, index: number) => U): Generator<U> {
    let i = 0
    for (const item of this) {
      yield callback(item, i++)
    }
  }

  private *_filterGen(callback: (item: T, index: number) => boolean): Generator<T> {
    let i = 0
    for (const item of this) {
      if (callback(item, i++)) yield item
    }
  }

  private *_takeGen(count: number): Generator<T> {
    let taken = 0
    for (const item of this) {
      yield item
      if (++taken >= count) break
    }
  }

  private *_skipGen(count: number): Generator<T> {
    let skipped = 0
    for (const item of this) {
      if (skipped < count) {
        skipped++
        continue
      }
      yield item
    }
  }

  private *_tapEachGen(callback: (item: T, index: number) => void): Generator<T> {
    let i = 0
    for (const item of this) {
      callback(item, i++)
      yield item
    }
  }

  private *_takeUntilTimeoutGen(timeout: Date): Generator<T> {
    for (const item of this) {
      if (new Date() >= timeout) break
      yield item
    }
  }

  private *_withHeartbeatGen(intervalMs: number, callback: () => void): Generator<T> {
    let lastBeat = Date.now()
    for (const item of this) {
      const now = Date.now()
      if (now - lastBeat >= intervalMs) {
        callback()
        lastBeat = now
      }
      yield item
    }
  }
}

// Imported after class declaration to handle the circular dependency at runtime.
// Both Collection and LazyCollection are class declarations, so by the time
// collect() is called both modules are fully evaluated.
import { Collection } from './Collection'
