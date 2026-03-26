import { CollectionException } from '../exceptions/CollectionException'
import { shuffleOf } from './sorting'

export function randomOne<T>(
  items: readonly T[],
  random: () => number = Math.random
): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(random() * items.length)]
}

export function randomMany<T>(
  items: readonly T[],
  count: number,
  random: () => number = Math.random
): T[] {
  if (count > items.length) {
    throw new CollectionException(
      `You requested ${count} items, but the collection only contains ${items.length} items.`
    )
  }
  if (count <= 0) return []
  return shuffleOf(items, random).slice(0, count)
}
