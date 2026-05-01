import { looseEqual } from '../support/deepEqual'
import type { Predicate } from '../support/types'

export function takeOf<T>(items: readonly T[], count: number): T[] {
  if (count < 0) return items.slice(count)
  return items.slice(0, count)
}

export function takeUntilOf<T>(items: readonly T[], target: T | Predicate<T>): T[] {
  const idx =
    typeof target === 'function'
      ? items.findIndex(target as Predicate<T>)
      : items.findIndex((it) => looseEqual(it, target))
  return idx === -1 ? [...items] : items.slice(0, idx)
}

export function takeWhileOf<T>(items: readonly T[], predicate: Predicate<T>): T[] {
  const idx = items.findIndex((item, i) => !predicate(item, i))
  return idx === -1 ? [...items] : items.slice(0, idx)
}

export function skipOf<T>(items: readonly T[], count: number): T[] {
  return items.slice(count)
}

export function skipUntilOf<T>(items: readonly T[], target: T | Predicate<T>): T[] {
  const idx =
    typeof target === 'function'
      ? items.findIndex(target as Predicate<T>)
      : items.findIndex((it) => looseEqual(it, target))
  return idx === -1 ? [] : items.slice(idx)
}

export function skipWhileOf<T>(items: readonly T[], predicate: Predicate<T>): T[] {
  const idx = items.findIndex((item, i) => !predicate(item, i))
  return idx === -1 ? [] : items.slice(idx)
}

export function sliceOf<T>(items: readonly T[], start: number, length?: number): T[] {
  if (length === undefined) return items.slice(start)
  if (length < 0) return items.slice(start, items.length + length)
  return items.slice(start, start + length)
}
