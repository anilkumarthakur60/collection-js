export type PlainObject = Record<string, unknown>

export type Scalar = string | number | bigint | boolean | symbol

export type Comparable = string | number | bigint | boolean | Date

export type Operator = '=' | '==' | '===' | '!=' | '!==' | '<>' | '<' | '<=' | '>' | '>='

export type SortDirection = 'asc' | 'desc'

export type Predicate<T> = (item: T, key: number) => boolean

export type Iteratee<T, R = unknown> = ((item: T, key: number) => R) | keyof T | string

export type ValueOf<T, K> = K extends keyof T ? T[K] : unknown

export type Comparator<T> = (a: T, b: T) => number

export type FlattenDepth1<T> = T extends ReadonlyArray<infer U> ? U : T
export type FlattenDepth2<T> = T extends ReadonlyArray<infer U> ? FlattenDepth1<U> : T
export type FlattenDepth3<T> = T extends ReadonlyArray<infer U> ? FlattenDepth2<U> : T
/** Approximation; for unbounded depth use `unknown` at runtime. */
export type DeepFlatten<T> = T extends ReadonlyArray<infer U> ? DeepFlatten<U> : T

export type ClassConstructor<T, A extends readonly unknown[] = readonly unknown[]> = new (
  ...args: A
) => T
