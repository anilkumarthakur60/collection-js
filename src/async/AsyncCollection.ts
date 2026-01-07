import { Collection } from '../collection/Collection'
import { mapWithConcurrency } from './concurrent'

export type AsyncSource<T> =
  | AsyncIterable<T>
  | Iterable<T>
  | (() => AsyncIterable<T> | Iterable<T>)

function resolveSource<T>(source: AsyncSource<T>): () => AsyncIterable<T> {
  if (typeof source === 'function') {
    return () => normalize(source())
  }
  return () => normalize(source)
}

function normalize<T>(value: AsyncIterable<T> | Iterable<T>): AsyncIterable<T> {
  if (Symbol.asyncIterator in (value as object)) return value as AsyncIterable<T>
  return (async function* () {
    for (const item of value as Iterable<T>) yield item
  })()
}

/**
 * Lazy async-iterable backed collection. Mirrors LazyCollection but every
 * terminal operation is async, and every transformation operates against an
 * `AsyncIterable<T>`. Supports bounded-parallelism `mapAsync`/`filterAsync`.
 *
 * Construct one via `new AsyncCollection(...)`, `AsyncCollection.fromAsyncIterable`,
 * or the `lazy()` helper bridge.
 */
export class AsyncCollection<T> implements AsyncIterable<T> {
  private readonly source: () => AsyncIterable<T>

  constructor(source: AsyncSource<T> = []) {
    this.source = resolveSource(source)
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.source()[Symbol.asyncIterator]()
  }

  // ─── Static factories ───────────────────────────────────────────────────────
  static from<T>(source: AsyncSource<T>): AsyncCollection<T> {
    return new AsyncCollection<T>(source)
  }

  static fromAsyncIterable<T>(source: AsyncIterable<T>): AsyncCollection<T> {
    return new AsyncCollection<T>(source)
  }

  static range(start: number, end: number, step: number = 1): AsyncCollection<number> {
    if (step === 0) throw new RangeError('range step must not be zero')
    return new AsyncCollection<number>(async function* () {
      if (step > 0) for (let i = start; i <= end; i += step) yield i
      else for (let i = start; i >= end; i += step) yield i
    })
  }

  static empty<T>(): AsyncCollection<T> {
    return new AsyncCollection<T>([])
  }

  // ─── Terminal: materialise ──────────────────────────────────────────────────
  async toArray(): Promise<T[]> {
    const out: T[] = []
    for await (const item of this.source()) out.push(item)
    return out
  }

  async collect(): Promise<Collection<T>> {
    return new Collection(await this.toArray())
  }

  async toJson(): Promise<string> {
    return JSON.stringify(await this.toArray())
  }

  async count(): Promise<number> {
    let n = 0
    const it = this.source()[Symbol.asyncIterator]()
    for (let next = await it.next(); !next.done; next = await it.next()) n++
    return n
  }

  async first(predicate?: (item: T, index: number) => boolean | Promise<boolean>): Promise<T | undefined> {
    let i = 0
    for await (const item of this.source()) {
      if (predicate === undefined || (await predicate(item, i))) return item
      i++
    }
    return undefined
  }

  async last(predicate?: (item: T, index: number) => boolean | Promise<boolean>): Promise<T | undefined> {
    let last: T | undefined = undefined
    let i = 0
    for await (const item of this.source()) {
      if (predicate === undefined || (await predicate(item, i))) last = item
      i++
    }
    return last
  }

  async every(predicate: (item: T, index: number) => boolean | Promise<boolean>): Promise<boolean> {
    let i = 0
    for await (const item of this.source()) {
      if (!(await predicate(item, i))) return false
      i++
    }
    return true
  }

  async some(predicate: (item: T, index: number) => boolean | Promise<boolean>): Promise<boolean> {
    let i = 0
    for await (const item of this.source()) {
      if (await predicate(item, i)) return true
      i++
    }
    return false
  }

  async reduce<R>(
    fn: (carry: R, item: T, index: number) => R | Promise<R>,
    initial: R,
  ): Promise<R> {
    let acc = initial
    let i = 0
    for await (const item of this.source()) {
      acc = await fn(acc, item, i)
      i++
    }
    return acc
  }

  async forEach(fn: (item: T, index: number) => void | Promise<void>): Promise<void> {
    let i = 0
    for await (const item of this.source()) {
      await fn(item, i)
      i++
    }
  }

  /**
   * Concurrent each. Tasks run with bounded parallelism. Use `forEach` if you
   * need strict ordering; this method does not preserve completion order.
   */
  async eachAsync(
    fn: (item: T, index: number) => void | Promise<void>,
    options: { concurrency?: number } = {},
  ): Promise<void> {
    const c = options.concurrency ?? 1
    await mapWithConcurrency(this.source(), c, async (item, i) => {
      await fn(item, i)
    })
  }

  // ─── Transformation (lazy) ──────────────────────────────────────────────────
  map<R>(fn: (item: T, index: number) => R | Promise<R>): AsyncCollection<R> {
    const src = this.source
    return new AsyncCollection<R>(async function* () {
      let i = 0
      for await (const item of src()) {
        yield await fn(item, i)
        i++
      }
    })
  }

  /**
   * Concurrent map: returns a NEW AsyncCollection backed by a buffered queue.
   * Up to `concurrency` callbacks run in parallel; results emerge in source
   * order. Memory grows with the gap between fastest and slowest task.
   */
  mapAsync<R>(
    fn: (item: T, index: number) => Promise<R> | R,
    options: { concurrency?: number } = {},
  ): AsyncCollection<R> {
    const concurrency = options.concurrency ?? 4
    const src = this.source
    return new AsyncCollection<R>(async function* () {
      const it = src()[Symbol.asyncIterator]()
      const pending = new Map<number, Promise<{ index: number; value: R }>>()
      let nextDispatch = 0
      let nextEmit = 0
      let exhausted = false

      const dispatch = async (): Promise<void> => {
        if (exhausted) return
        const next = await it.next()
        if (next.done) {
          exhausted = true
          return
        }
        const idx = nextDispatch++
        pending.set(
          idx,
          Promise.resolve(fn(next.value, idx)).then((value) => ({ index: idx, value })),
        )
      }

      while (pending.size < concurrency && !exhausted) await dispatch()

      while (pending.size > 0) {
        const ready = pending.get(nextEmit)
        if (ready) {
          const { value } = await ready
          pending.delete(nextEmit)
          yield value
          nextEmit++
          if (!exhausted) await dispatch()
        } else {
          // Head of line not done — wait for any task to settle, then loop.
          await Promise.race(pending.values())
        }
      }
    })
  }

  filter(predicate: (item: T, index: number) => boolean | Promise<boolean>): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      let i = 0
      for await (const item of src()) {
        if (await predicate(item, i)) yield item
        i++
      }
    })
  }

  /** Concurrent filter — predicate runs in parallel; output stays in source order. */
  filterAsync(
    predicate: (item: T, index: number) => Promise<boolean> | boolean,
    options: { concurrency?: number } = {},
  ): AsyncCollection<T> {
    return this.mapAsync(async (item, i) => ({ item, keep: await predicate(item, i) }), options)
      .filter((entry) => entry.keep)
      .map((entry) => entry.item)
  }

  flatMap<R>(fn: (item: T, index: number) => Iterable<R> | AsyncIterable<R> | Promise<Iterable<R>>): AsyncCollection<R> {
    const src = this.source
    return new AsyncCollection<R>(async function* () {
      let i = 0
      for await (const item of src()) {
        const result = await fn(item, i)
        if (Symbol.asyncIterator in (result as object)) {
          for await (const v of result as AsyncIterable<R>) yield v
        } else {
          for (const v of result as Iterable<R>) yield v
        }
        i++
      }
    })
  }

  take(count: number): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      if (count <= 0) return
      let n = 0
      for await (const item of src()) {
        if (n >= count) return
        yield item
        n++
      }
    })
  }

  skip(count: number): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      let n = 0
      for await (const item of src()) {
        if (n >= count) yield item
        n++
      }
    })
  }

  takeWhile(predicate: (item: T, index: number) => boolean | Promise<boolean>): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      let i = 0
      for await (const item of src()) {
        if (!(await predicate(item, i))) return
        yield item
        i++
      }
    })
  }

  skipWhile(predicate: (item: T, index: number) => boolean | Promise<boolean>): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      let started = false
      let i = 0
      for await (const item of src()) {
        if (!started && (await predicate(item, i))) {
          i++
          continue
        }
        started = true
        yield item
        i++
      }
    })
  }

  chunk(size: number): AsyncCollection<T[]> {
    if (size <= 0) throw new RangeError('chunk size must be positive')
    const src = this.source
    return new AsyncCollection<T[]>(async function* () {
      let buf: T[] = []
      for await (const item of src()) {
        buf.push(item)
        if (buf.length === size) {
          yield buf
          buf = []
        }
      }
      if (buf.length > 0) yield buf
    })
  }

  tap(fn: (item: T, index: number) => void | Promise<void>): AsyncCollection<T> {
    const src = this.source
    return new AsyncCollection<T>(async function* () {
      let i = 0
      for await (const item of src()) {
        await fn(item, i)
        yield item
        i++
      }
    })
  }
}
