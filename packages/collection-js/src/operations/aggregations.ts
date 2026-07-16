import { valueRetriever, type RetrieverInput } from '@/support/valueRetriever'

/**
 * The single numeric-coercion rule shared by every numeric aggregate in the
 * library — `sum`/`average`/`median` here and `variance`/`stddev`/`quantile`/
 * `percentile`/`histogram`/`correlation` in stats.ts:
 *
 * - finite numbers pass through unchanged
 * - numeric strings are converted with `Number()`
 * - booleans coerce to `1`/`0`
 * - everything else — `null`, `undefined`, `NaN`, `±Infinity`, empty or
 *   non-numeric strings, objects, Dates — is SKIPPED (never silently treated
 *   as `0`), so e.g. `average` and `stddev` over the same data describe the
 *   same population.
 *
 * `max`/`min` are order-based rather than sum-based: they compare raw values
 * type-preservingly (numbers, strings, Dates, bigints) and skip only values
 * with no defined order (`null`, `undefined`, `NaN`). `mode` counts raw
 * values by identity and applies no numeric coercion at all.
 *
 * Returns the coerced number, or `undefined` when the value is skipped.
 */
export function coerceNumeric(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/** Numeric values of `items` under the shared coercion rule (see `coerceNumeric`). */
export function numericValuesOf<T>(items: readonly T[], by?: RetrieverInput<T, unknown>): number[] {
  const get = valueRetriever<T, unknown>(by)
  const out: number[] = []
  for (let i = 0; i < items.length; i++) {
    const n = coerceNumeric(get(items[i], i))
    if (n !== undefined) out.push(n)
  }
  return out
}

/**
 * Order-aware comparison used by `maxOf`/`minOf`. Unlike summing, max/min must
 * preserve the original value type, so we compare numbers numerically, strings
 * lexicographically, `Date`s/`bigint`s by their natural order, and fall back to
 * numeric coercion (then string compare) for mixed input. Mirrors PHP/Laravel,
 * where `max()`/`min()` operate on any comparable, not just numbers.
 */
function compareForExtent(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : a > b ? 1 : 0
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0
  const na = Number(a)
  const nb = Number(b)
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
  const sa = String(a)
  const sb = String(b)
  return sa < sb ? -1 : sa > sb ? 1 : 0
}

export function sumOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number {
  const values = numericValuesOf(items, by)
  let total = 0
  for (const v of values) total += v
  return total
}

/**
 * Average of the numeric values under the shared coercion rule: non-numeric
 * entries are excluded from both the sum and the divisor (matching Laravel's
 * `avg`, which skips nulls). Returns 0 when nothing numeric is present.
 */
export function averageOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number {
  const values = numericValuesOf(items, by)
  if (values.length === 0) return 0
  let total = 0
  for (const v of values) total += v
  return total / values.length
}

export function maxOf<T, R = number>(
  items: readonly T[],
  by?: RetrieverInput<T, R>
): R | undefined {
  const get = valueRetriever<T, R>(by)
  let max: R | undefined = undefined
  let seen = false
  for (let i = 0; i < items.length; i++) {
    const v = get(items[i], i)
    if (v == null || (typeof v === 'number' && Number.isNaN(v))) continue
    if (!seen || compareForExtent(v, max) > 0) {
      max = v
      seen = true
    }
  }
  return max
}

export function minOf<T, R = number>(
  items: readonly T[],
  by?: RetrieverInput<T, R>
): R | undefined {
  const get = valueRetriever<T, R>(by)
  let min: R | undefined = undefined
  let seen = false
  for (let i = 0; i < items.length; i++) {
    const v = get(items[i], i)
    if (v == null || (typeof v === 'number' && Number.isNaN(v))) continue
    if (!seen || compareForExtent(v, min) < 0) {
      min = v
      seen = true
    }
  }
  return min
}

export function medianOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, number>
): number | undefined {
  const values = numericValuesOf(items, by).sort((a, b) => a - b)
  if (values.length === 0) return undefined
  const mid = Math.floor(values.length / 2)
  return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
}

export function modeOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, unknown>
): unknown[] | undefined {
  if (items.length === 0) return undefined
  const get = valueRetriever<T, unknown>(by)
  const counts = new Map<unknown, number>()
  let highest = 0
  for (let i = 0; i < items.length; i++) {
    const key = get(items[i], i)
    const next = (counts.get(key) ?? 0) + 1
    counts.set(key, next)
    if (next > highest) highest = next
  }
  const modes: unknown[] = []
  for (const [key, count] of counts) if (count === highest) modes.push(key)
  return modes
}

export function percentageOf<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
  precision: number = 2
): number {
  if (items.length === 0) return 0
  let count = 0
  for (let i = 0; i < items.length; i++) if (predicate(items[i], i)) count++
  const factor = 10 ** precision
  return Math.round((count / items.length) * 100 * factor) / factor
}

export function countByOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, unknown>
): Map<unknown, number> {
  const get = valueRetriever<T, unknown>(by)
  const counts = new Map<unknown, number>()
  for (let i = 0; i < items.length; i++) {
    const key = get(items[i], i)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}
