import { isObjectLike } from './isObject'

/**
 * Recursive structural equality for arrays, plain objects, primitives, Date, RegExp.
 * Cycles are not handled — assume DAG-shaped data (typical for collection items).
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true
  if (!isObjectLike(a) || !isObjectLike(b)) return false

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  }
  if (a instanceof RegExp || b instanceof RegExp) {
    return a instanceof RegExp && b instanceof RegExp && a.source === b.source && a.flags === b.flags
  }

  const aIsArr = Array.isArray(a)
  const bIsArr = Array.isArray(b)
  if (aIsArr !== bIsArr) return false
  if (aIsArr && bIsArr) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false
    }
  }
  return true
}

/**
 * Loose comparison emulating PHP's `==` for the common cases used in
 * Laravel collections (strings vs numbers, etc.). Falls back to deep equality
 * for object-like values.
 */
export function looseEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a == b // covers null/undefined coercion
  if (typeof a === typeof b) return deepEqual(a, b)

  if (
    (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') &&
    (typeof b === 'string' || typeof b === 'number' || typeof b === 'boolean')
  ) {
     
    return a == b
  }
  return false
}
