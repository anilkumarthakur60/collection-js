import { LazyCollection, type LazySource } from '../collection/LazyCollection'

/** Helper for building a LazyCollection from a generator function or iterable. */
export function lazy<T>(source: LazySource<T> = []): LazyCollection<T> {
  return new LazyCollection<T>(source)
}
