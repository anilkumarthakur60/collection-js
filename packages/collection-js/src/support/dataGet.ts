import { isObjectLike } from '@/support/isObject'

/**
 * Coerce any value to a string for display/matching without triggering the
 * unhelpful `[object Object]` — objects (and arrays) are JSON-serialized, other
 * values go through `String()`. Never throws.
 */
export function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  if (typeof value === 'symbol') return value.toString()
  if (typeof value === 'function') return value.toString()
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return Object.prototype.toString.call(value)
  }
}

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
  const segments: string[] = typeof path === 'string' ? path.split('.') : [...path]

  let current: unknown = target
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment === '*') {
      if (!Array.isArray(current)) return defaultValue
      const rest = segments.slice(i + 1)
      const collected: unknown[] = []
      for (const entry of current as readonly unknown[]) {
        const value = rest.length === 0 ? entry : dataGet(entry, rest, undefined)
        if (Array.isArray(value)) collected.push(...(value as readonly unknown[]))
        else collected.push(value)
      }
      return collected
    }

    if (current == null) return defaultValue
    if (Array.isArray(current)) {
      const idx = Number(segment)
      if (Number.isInteger(idx) && idx >= 0 && idx < current.length) {
        current = (current as readonly unknown[])[idx]
        continue
      }
      return defaultValue
    }
    if (isObjectLike(current) && segment in current) {
      current = current[segment]
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
