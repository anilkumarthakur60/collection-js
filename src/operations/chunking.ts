import type { Predicate } from '../support/types'

export function chunkOf<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return []
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/**
 * Group consecutive items that satisfy the predicate. The predicate receives
 * the current item, its index, and the chunk built so far (to mirror Laravel).
 */
export function chunkWhileOf<T>(
  items: readonly T[],
  predicate: (item: T, key: number, chunk: readonly T[]) => boolean,
): T[][] {
  if (items.length === 0) return []
  const result: T[][] = []
  let current: T[] = [items[0]]
  for (let i = 1; i < items.length; i++) {
    if (predicate(items[i], i, current)) {
      current.push(items[i])
    } else {
      result.push(current)
      current = [items[i]]
    }
  }
  result.push(current)
  return result
}

export function slidingOf<T>(items: readonly T[], size: number, step: number = 1): T[][] {
  if (size <= 0 || step <= 0) return []
  const out: T[][] = []
  for (let i = 0; i + size <= items.length; i += step) out.push(items.slice(i, i + size))
  return out
}

export function splitOf<T>(items: readonly T[], groups: number): T[][] {
  if (groups <= 0 || items.length === 0) return []
  const out: T[][] = []
  const groupSize = Math.floor(items.length / groups)
  let remainder = items.length % groups
  let cursor = 0
  for (let g = 0; g < groups; g++) {
    const extra = remainder > 0 ? 1 : 0
    out.push(items.slice(cursor, cursor + groupSize + extra))
    cursor += groupSize + extra
    if (remainder > 0) remainder--
  }
  return out.filter((g) => g.length > 0)
}

export function splitInOf<T>(items: readonly T[], groups: number): T[][] {
  if (groups <= 0 || items.length === 0) return []
  const groupSize = Math.ceil(items.length / groups)
  const out: T[][] = []
  for (let i = 0; i < items.length; i += groupSize) out.push(items.slice(i, i + groupSize))
  return out
}

export function partitionOf<T>(items: readonly T[], predicate: Predicate<T>): [T[], T[]] {
  const truthy: T[] = []
  const falsy: T[] = []
  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i], i)) truthy.push(items[i])
    else falsy.push(items[i])
  }
  return [truthy, falsy]
}

export function forPageOf<T>(items: readonly T[], page: number, perPage: number): T[] {
  if (page < 1 || perPage <= 0) return []
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

export function nthOf<T>(items: readonly T[], step: number, offset: number = 0): T[] {
  if (step <= 0) return []
  const out: T[] = []
  for (let i = offset; i < items.length; i += step) out.push(items[i])
  return out
}
