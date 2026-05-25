// Order matters: Collection registers `setLazyConstructor`, then LazyCollection
// imports Collection and calls it. We import Collection first so the wiring is
// in place before any external consumer reaches LazyCollection.
export { Collection } from '@/collection/Collection'
export { LazyCollection } from '@/collection/LazyCollection'
export type { LazySource } from '@/collection/LazyCollection'
export { createHigherOrderProxy, HIGHER_ORDER_TARGETS } from '@/collection/HigherOrderProxy'
export type { HigherOrderTarget } from '@/collection/HigherOrderProxy'
