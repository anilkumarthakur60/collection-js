export function reduceOf<T, R>(
  items: readonly T[],
  fn: (carry: R, item: T, index: number) => R,
  initial: R,
): R {
  let acc = initial
  for (let i = 0; i < items.length; i++) acc = fn(acc, items[i], i)
  return acc
}

/**
 * Spread reduce — the accumulator is a tuple. The reducer is called with the
 * tuple spread followed by the current item; it returns the next tuple.
 * Mirrors Laravel's `reduceSpread`.
 */
export function reduceSpreadOf<T, R extends readonly unknown[]>(
  items: readonly T[],
  fn: (carry: R, item: T, index: number) => R,
  ...initials: R
): R {
  let carry = initials
  for (let i = 0; i < items.length; i++) carry = fn(carry, items[i], i)
  return carry
}
