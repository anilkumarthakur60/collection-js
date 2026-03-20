import collect from './collect'

export { Collection } from './Collection'
export { LazyCollection } from './LazyCollection'
export { collect } from './collect'
export { ItemNotFoundException } from './exceptions/ItemNotFoundException'
export { UnexpectedValueException } from './exceptions/UnexpectedValueException'
export { CollectionException } from './exceptions/CollectionException'
export type {
  FlattenType,
  PlainObject,
  Scalar,
  Operator,
  SortDirection,
} from './types/core'
export type {
  Predicate,
  PredicateChunkWhile,
  PredicateContains,
  Iteratee,
  MapCallback,
  SortCallback,
  GroupByCallback,
} from './types/predicates'
export type { IReadonlyCollection, ILazyCollection } from './types/collection'

export default collect
