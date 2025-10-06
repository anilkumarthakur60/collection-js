import { Collection } from './Collection'
import { LazyCollection } from './LazyCollection'

function collect<T>(items: T[] = []): Collection<T> {
  return new Collection(items)
}

export { collect, Collection, LazyCollection }
export default collect
