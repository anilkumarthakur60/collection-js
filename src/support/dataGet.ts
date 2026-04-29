import { isObjectLike } from './isObject'

/**
 * Resolve a nested value from an object/array using "dot" notation, mirroring
 * Laravel's `data_get` helper. Supports `*` to traverse arrays and produces
 * arrays of leaf values when wildcards are used.
 */
export function dataGet(target: unknown, path: string | readonly string[], defaultValue?: unknown): unknown {
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

/** Set a nested value via dot path; mutates and returns the target. */
export function dataSet(target: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const segments = path.split('.')
  let cursor: Record<string, unknown> = target
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    if (!isObjectLike(cursor[seg])) cursor[seg] = {}
    cursor = cursor[seg] as Record<string, unknown>
  }
  cursor[segments[segments.length - 1]] = value
  return target
}
