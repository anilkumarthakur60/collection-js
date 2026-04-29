export type WhenCondition<C> = boolean | ((carrier: C) => boolean)

export function resolveCondition<C>(carrier: C, condition: WhenCondition<C>): boolean {
  return typeof condition === 'function'
    ? Boolean((condition as (c: C) => boolean)(carrier))
    : Boolean(condition)
}

/**
 * Functional `when`: invoke the matching callback and return whatever it
 * returns, or the carrier itself when the callback returns void/undefined.
 */
export function whenOf<C>(
  carrier: C,
  condition: WhenCondition<C>,
  truthy: (carrier: C, value: boolean) => C | void,
  falsy?: (carrier: C, value: boolean) => C | void
): C {
  const matched = resolveCondition(carrier, condition)
  const cb = matched ? truthy : falsy
  if (!cb) return carrier
  const result = cb(carrier, matched)
  return result === undefined ? carrier : result
}
