export type Predicate<T> = (item: T, index: number) => boolean
export type PredicateChunkWhile<T> = (item: T, index: number, array: T[]) => boolean
export type PredicateContains<T> = (item: T) => boolean
export type Iteratee<T> = (item: T) => string | number | boolean | symbol
