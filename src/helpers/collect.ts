import { Collection } from '../collection/Collection'

/** Laravel's `collect()` helper — wraps any iterable/array-like into a Collection. */
export function collect<T>(
  items: Iterable<T> | ArrayLike<T> | null | undefined = []
): Collection<T> {
  return new Collection<T>(items as Iterable<T>)
}
