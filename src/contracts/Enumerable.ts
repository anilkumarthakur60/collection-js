import type { Arrayable } from './Arrayable'
import type { Jsonable } from './Jsonable'

/**
 * Shared contract between Collection<T> and LazyCollection<T>.
 * Methods that must exist on both forms — mirrors Laravel's
 * `Illuminate\Support\Enumerable` interface.
 *
 * Methods that mutate the underlying source (push/pop/shift/etc.) are
 * intentionally excluded — they only exist on the eager Collection.
 */
export interface Enumerable<T> extends Iterable<T>, Arrayable<T>, Jsonable {
  count(): number
  isEmpty(): boolean
  isNotEmpty(): boolean
  toArray(): T[]
  toJson(): string
}
