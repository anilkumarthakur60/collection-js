import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isNaN(n) ? 0 : n
  }
  if (typeof value === 'boolean') return value ? 1 : 0
  return 0
}

export function sumOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number {
  const get = valueRetriever<T, number>(by)
  let total = 0
  for (let i = 0; i < items.length; i++) total += toNumber(get(items[i], i))
  return total
}

export function averageOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number {
  if (items.length === 0) return 0
  return sumOf(items, by) / items.length
}

export function maxOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number | undefined {
  if (items.length === 0) return undefined
  const get = valueRetriever<T, number>(by)
  let max = -Infinity
  for (let i = 0; i < items.length; i++) {
    const v = toNumber(get(items[i], i))
    if (v > max) max = v
  }
  return max === -Infinity ? undefined : max
}

export function minOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number | undefined {
  if (items.length === 0) return undefined
  const get = valueRetriever<T, number>(by)
  let min = Infinity
  for (let i = 0; i < items.length; i++) {
    const v = toNumber(get(items[i], i))
    if (v < min) min = v
  }
  return min === Infinity ? undefined : min
}

export function medianOf<T>(items: readonly T[], by?: RetrieverInput<T, number>): number | undefined {
  if (items.length === 0) return undefined
  const get = valueRetriever<T, number>(by)
  const values = items.map((item, i) => toNumber(get(item, i))).sort((a, b) => a - b)
  const mid = Math.floor(values.length / 2)
  return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid]
}

export function modeOf<T>(items: readonly T[], by?: RetrieverInput<T, unknown>): unknown[] | undefined {
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
  precision: number = 2,
): number {
  if (items.length === 0) return 0
  let count = 0
  for (let i = 0; i < items.length; i++) if (predicate(items[i], i)) count++
  const factor = 10 ** precision
  return Math.round(((count / items.length) * 100) * factor) / factor
}

export function countByOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, unknown>,
): Map<unknown, number> {
  const get = valueRetriever<T, unknown>(by)
  const counts = new Map<unknown, number>()
  for (let i = 0; i < items.length; i++) {
    const key = get(items[i], i)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}
