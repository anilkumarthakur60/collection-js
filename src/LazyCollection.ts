import type { ILazyCollection } from './types/collection'

export class LazyCollection<T> implements ILazyCollection<T> {
  private readonly source: T[]

  constructor(source: T[]) {
    this.source = source
  }

  *[Symbol.iterator](): Generator<T> {
    yield* this.source
  }

  all(): T[] {
    return [...this.source]
  }

  count(): number {
    return this.source.length
  }

  first(): T | null {
    return this.source.length > 0 ? this.source[0] : null
  }

  toArray(): T[] {
    return this.source
  }

  each(callback: (item: T, index: number) => void | false): this {
    for (let i = 0; i < this.source.length; i++) {
      if (callback(this.source[i], i) === false) break
    }
    return this
  }

  map<U>(callback: (item: T, index: number) => U): LazyCollection<U> {
    return new LazyCollection<U>(this.source.map(callback))
  }

  filter(callback: (item: T, index: number) => boolean): LazyCollection<T> {
    return new LazyCollection<T>(this.source.filter(callback))
  }

  take(count: number): LazyCollection<T> {
    return new LazyCollection<T>(this.source.slice(0, count))
  }

  skip(count: number): LazyCollection<T> {
    return new LazyCollection<T>(this.source.slice(count))
  }

  where<K extends keyof T>(key: K, value: T[K]): LazyCollection<T> {
    return new LazyCollection<T>(this.source.filter((item) => item[key] === value))
  }

  collect(): Collection<T> {
    return new Collection<T>(this.source)
  }
}

// Imported after class declaration to handle the circular dependency at runtime.
// Both Collection and LazyCollection are class declarations, so by the time
// collect() is called both modules are fully evaluated.
import { Collection } from './Collection'
