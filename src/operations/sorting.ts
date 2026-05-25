import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'
import type { Comparator, SortDirection } from '../support/types'

const defaultCompare: Comparator<unknown> = (a, b) => {
  if (a === b) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export function sortOf<T>(
  items: readonly T[],
  comparator: Comparator<T> = defaultCompare as Comparator<T>
): T[] {
  return [...items].sort(comparator)
}

export function sortDescOf<T>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => -defaultCompare(a, b))
}

export type SortBySpec<T> =
  | RetrieverInput<T, unknown>
  | readonly [RetrieverInput<T, unknown>, SortDirection]
  | Comparator<T>

export function sortByOf<T>(
  items: readonly T[],
  spec: SortBySpec<T> | readonly SortBySpec<T>[],
  descending = false
): T[] {
  // Normalize to an array of comparators applied in order.
  const specs =
    Array.isArray(spec) && !isRetrieverTuple(spec)
      ? (spec as readonly SortBySpec<T>[])
      : [spec as SortBySpec<T>]

  const comparators: Comparator<T>[] = specs.map((s) => toComparator<T>(s, descending))

  return [...items].sort((a, b) => {
    for (const cmp of comparators) {
      const r = cmp(a, b)
      if (r !== 0) return r
    }
    return 0
  })
}

function isRetrieverTuple<T>(spec: unknown): spec is readonly [RetrieverInput<T>, SortDirection] {
  return Array.isArray(spec) && spec.length === 2 && (spec[1] === 'asc' || spec[1] === 'desc')
}

function toComparator<T>(spec: SortBySpec<T>, descending: boolean): Comparator<T> {
  if (typeof spec === 'function' && spec.length === 2) return spec as Comparator<T>
  if (isRetrieverTuple<T>(spec)) {
    const [retriever, dir] = spec
    return makeRetrieverComparator(retriever, dir === 'desc')
  }
  return makeRetrieverComparator(spec as RetrieverInput<T>, descending)
}

function makeRetrieverComparator<T>(
  retriever: RetrieverInput<T>,
  descending: boolean
): Comparator<T> {
  const get = valueRetriever<T, unknown>(retriever)
  return (a, b) => {
    const av = get(a, 0)
    const bv = get(b, 0)
    const r = defaultCompare(av, bv)
    return descending ? -r : r
  }
}

export function sortByDescOf<T>(items: readonly T[], spec: SortBySpec<T>): T[] {
  return sortByOf(items, spec, true)
}

export function sortKeysOf<T extends object>(items: readonly T[], descending = false): T[] {
  return items.map((item) => {
    if (item === null || typeof item !== 'object') return item
    const keys = Object.keys(item).sort()
    if (descending) keys.reverse()
    const sorted: Record<string, unknown> = {}
    for (const k of keys) sorted[k] = (item as Record<string, unknown>)[k]
    return sorted as unknown as T
  })
}

export function sortKeysUsingOf<T extends object>(
  items: readonly T[],
  comparator: (a: string, b: string) => number
): T[] {
  return items.map((item) => {
    if (item === null || typeof item !== 'object') return item
    const keys = Object.keys(item).sort(comparator)
    const sorted: Record<string, unknown> = {}
    for (const k of keys) sorted[k] = (item as Record<string, unknown>)[k]
    return sorted as unknown as T
  })
}

export function shuffleOf<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function reverseOf<T>(items: readonly T[]): T[] {
  return [...items].reverse()
}
