import type { Scalar } from './core'

export type Predicate<T> = (item: T, index: number) => boolean

export type PredicateChunkWhile<T> = (item: T, index: number, array: T[]) => boolean

export type PredicateContains<T> = (item: T) => boolean

export type Iteratee<T> = (item: T) => Scalar

export type MapCallback<T, U> = (item: T, index: number) => U

export type ReduceCallback<T, U> = (accumulator: U, item: T, index: number) => U

export type SortCallback<T> = (a: T, b: T) => number

export type GroupByCallback<T> = (item: T, index: number) => string

export type TapCallback<T> = (item: T, index: number) => void

export type ValueResolver<T, U> = ((item: T) => U) | keyof T
