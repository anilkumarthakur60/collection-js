import collect from './collect'

export { Collection } from './Collection'
export { LazyCollection } from './LazyCollection'
export { collect } from './collect'
export { CollectionException } from './exceptions/CollectionException'
export { ItemNotFoundException } from './exceptions/ItemNotFoundException'
export { MultipleItemsFoundException } from './exceptions/MultipleItemsFoundException'
export { UnexpectedValueException } from './exceptions/UnexpectedValueException'
export type { FlattenType, PlainObject, Scalar, Operator, SortDirection } from './types/core'
export type {
  Predicate,
  PredicateChunkWhile,
  PredicateContains,
  Iteratee,
  MapCallback,
  ReduceCallback,
  SortCallback,
  GroupByCallback,
  TapCallback,
  ValueResolver
} from './types/predicates'
export type { IReadonlyCollection, ILazyCollection } from './types/collection'

export default collect
