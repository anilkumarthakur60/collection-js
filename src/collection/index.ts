// Order matters: Collection registers `setLazyConstructor`, then LazyCollection
// imports Collection and calls it. We import Collection first so the wiring is
// in place before any external consumer reaches LazyCollection.
export { Collection } from './Collection'
export { LazyCollection } from './LazyCollection'
export type { LazySource } from './LazyCollection'
export { createHigherOrderProxy, HIGHER_ORDER_TARGETS } from './HigherOrderProxy'
export type { HigherOrderTarget } from './HigherOrderProxy'
