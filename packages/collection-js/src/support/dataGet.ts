import { isObjectLike } from '@/support/isObject'

/**
 * Resolve a nested value from an object/array using "dot" notation, mirroring
 * Laravel's `data_get` helper. Supports `*` to traverse arrays and produces
 * arrays of leaf values when wildcards are used.
 */
export function dataGet(
  target: unknown,
  path: string | readonly string[],
  defaultValue?: unknown
): unknown {
  if (target == null) return defaultValue
  const segments = Array.isArray(path) ? [...path] : String(path).split('.')

  let current: unknown = target
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment === '*') {
      if (!Array.isArray(current)) return defaultValue
      const rest = segments.slice(i + 1)
      const collected: unknown[] = []
      for (const entry of current) {
        const value = rest.length === 0 ? entry : dataGet(entry, rest, undefined)
        if (Array.isArray(value)) collected.push(...value)
        else collected.push(value)
      }
      return collected
    }

    if (current == null) return defaultValue
    if (Array.isArray(current)) {
      const idx = Number(segment)
      if (Number.isInteger(idx) && idx >= 0 && idx < current.length) {
        current = current[idx]
        continue
      }
      return defaultValue
    }
    if (isObjectLike(current) && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment]
      continue
    }
    return defaultValue
  }
  return current
}

/** Path segments that could rewrite the prototype chain if traversed/assigned. */
const UNSAFE_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Set a nested value via dot path; mutates and returns the target.
 *
 * Security: paths containing `__proto__`, `constructor`, or `prototype`
 * segments are rejected outright (the target is returned unchanged), and
 * traversal only ever descends into the target's *own* object-like members —
 * inherited members (e.g. `Object.prototype`) are shadowed with a fresh
 * container instead. This prevents prototype pollution via attacker-controlled
 * keys (reachable through `undot()` and the public `dataSet` export).
 */
export function dataSet(
  target: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const segments = path.split('.')
  if (segments.some((seg) => UNSAFE_SEGMENTS.has(seg))) return target
  let cursor: Record<string, unknown> = target
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    if (!Object.prototype.hasOwnProperty.call(cursor, seg) || !isObjectLike(cursor[seg])) {
      cursor[seg] = {}
    }
    cursor = cursor[seg] as Record<string, unknown>
  }
  cursor[segments[segments.length - 1]] = value
  return target
}
