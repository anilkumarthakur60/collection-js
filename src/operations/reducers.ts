export function reduceOf<T, R>(
  items: readonly T[],
  fn: (carry: R, item: T, index: number) => R,
  initial: R
): R {
  let acc = initial
  for (let i = 0; i < items.length; i++) acc = fn(acc, items[i], i)
  return acc
}

/**
 * Spread reduce — the reducer is called with the carry tuple spread, followed
 * by the current item and its index, and returns the next carry tuple. Mirrors
 * Laravel's `reduceSpread`:
 *
 *   reduceSpread((a, b, item) => [a + item, b * item], 0, 1)
 */
export function reduceSpreadOf<T, R extends readonly unknown[]>(
  items: readonly T[],
  fn: (...args: readonly unknown[]) => R,
  ...initials: R
): R {
  let carry: R = initials
  for (let i = 0; i < items.length; i++) {
    carry = fn(...carry, items[i], i) as R
  }
  return carry
}
