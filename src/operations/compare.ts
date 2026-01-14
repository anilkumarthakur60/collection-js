import { dataGet } from '../support/dataGet'
import { deepEqual, looseEqual } from '../support/deepEqual'
import { isObjectLike } from '../support/isObject'
import type { Predicate } from '../support/types'

export type ContainsArg<T> = T | Predicate<T> | Partial<T> | { [key: string]: unknown }

function matchesShape(item: unknown, shape: Record<string, unknown>): boolean {
  if (!isObjectLike(item)) return false
  const target = item as Record<string, unknown>
  for (const key of Object.keys(shape)) {
    if (!looseEqual(target[key], shape[key])) return false
  }
  return true
}

export type ContainsSpec<T> =
  | { kind: 'predicate'; predicate: Predicate<T> }
  | { kind: 'shape'; shape: Record<string, unknown> }
  | { kind: 'keyValue'; key: string; value: unknown }
  | { kind: 'value'; value: unknown }

/** Loose match unless `strict` is true. */
export function containsOf<T>(items: readonly T[], spec: ContainsSpec<T>, strict = false): boolean {
  switch (spec.kind) {
    case 'predicate':
      for (let i = 0; i < items.length; i++) if (spec.predicate(items[i], i)) return true
      return false
    case 'keyValue':
      return items.some((item) => {
        const got = dataGet(item, spec.key)
        return strict
          ? got === spec.value || deepEqual(got, spec.value)
          : looseEqual(got, spec.value)
      })
    case 'shape':
      return items.some((item) => matchesShape(item, spec.shape))
    case 'value':
      return items.some((item) => (strict ? item === spec.value : looseEqual(item, spec.value)))
  }
}

export function doesntContainOf<T>(
  items: readonly T[],
  spec: ContainsSpec<T>,
  strict = false
): boolean {
  return !containsOf(items, spec, strict)
}

/**
 * Resolve user-supplied arguments into a normalised ContainsSpec.
 * Used by both Collection.contains/doesntContain and their lazy counterparts.
 */
export function resolveContainsSpec<T>(
  target: ContainsArg<T>,
  value: unknown,
  hasValue: boolean
): ContainsSpec<T> {
  if (typeof target === 'function') return { kind: 'predicate', predicate: target as Predicate<T> }
  if (
    hasValue &&
    (typeof target === 'string' || typeof target === 'number' || typeof target === 'symbol')
  ) {
    return { kind: 'keyValue', key: String(target), value }
  }
  if (isObjectLike(target) && !Array.isArray(target)) {
    return { kind: 'shape', shape: target as Record<string, unknown> }
  }
  return { kind: 'value', value: target }
}

export function everyOf<T>(items: readonly T[], predicate: Predicate<T>): boolean {
  for (let i = 0; i < items.length; i++) if (!predicate(items[i], i)) return false
  return true
}

export function someOf<T>(items: readonly T[], predicate: Predicate<T>): boolean {
  for (let i = 0; i < items.length; i++) if (predicate(items[i], i)) return true
  return false
}

export function searchOf<T>(
  items: readonly T[],
  target: T | Predicate<T>,
  strict = false
): number | false {
  if (typeof target === 'function') {
    const idx = items.findIndex(target as Predicate<T>)
    return idx === -1 ? false : idx
  }
  const idx = items.findIndex((item) => (strict ? item === target : looseEqual(item, target)))
  return idx === -1 ? false : idx
}
