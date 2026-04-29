// ─── Public API ─────────────────────────────────────────────────────────────
// `collect` is the default helper to keep parity with Laravel's `collect()`.

import { collect } from './helpers/collect'

// Classes
export { Collection } from './collection/Collection'
export { LazyCollection } from './collection/LazyCollection'
export { AsyncCollection } from './async/AsyncCollection'
export type { AsyncSource } from './async/AsyncCollection'
export { mapWithConcurrency } from './async/concurrent'

// Helpers
export { collect } from './helpers/collect'
export { lazy } from './helpers/lazy'

// I/O
export { parseCsv, toCsv } from './io/csv'
export type { CsvParseOptions, CsvSerializeOptions } from './io/csv'
export { parseJsonl, toJsonl, parseJsonlStream } from './io/jsonl'
export { fromReadable, lines } from './io/streams'
export type { FromReadableOptions, ReadableLike } from './io/streams'

// Higher-order messaging primitive (so users can build their own proxies)
export { createHigherOrderProxy, HIGHER_ORDER_TARGETS } from './collection/HigherOrderProxy'
export type { HigherOrderTarget } from './collection/HigherOrderProxy'

// Macroable primitive (so users can extend Collection from their own code,
// even after installing this package from npm)
export {
  registerMacro,
  hasMacro,
  getMacro,
  flushMacros,
  applyMacroable,
} from './macros/Macroable'
export type { MacroableTarget } from './macros/Macroable'

// Contracts
export type { Arrayable, Jsonable, Enumerable, MacroFn, MacroableStatic } from './contracts'
export { isArrayable } from './contracts'

// Exceptions
export {
  CollectionException,
  ItemNotFoundException,
  MultipleItemsFoundException,
  UnexpectedValueException,
} from './exceptions'

// Types
export type {
  PlainObject,
  Scalar,
  Comparable,
  Operator,
  SortDirection,
  Predicate,
  Iteratee,
  Comparator,
  ClassConstructor,
} from './support/types'
export type { RetrieverInput } from './support/valueRetriever'
export type { LazySource } from './collection/LazyCollection'

// Pure operation modules (advanced users can import individual operations)
export * as operations from './operations'

// Internal support utilities (advanced users)
export { dataGet, dataSet } from './support/dataGet'
export { deepEqual, looseEqual } from './support/deepEqual'
export { deepClone } from './support/deepClone'
export { valueRetriever } from './support/valueRetriever'
export { operatorForWhere, isOperator } from './support/operatorForWhere'
export { isPlainObject, isObjectLike, isFunction } from './support/isObject'

export default collect
