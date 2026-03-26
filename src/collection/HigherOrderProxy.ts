import { dataGet } from '../support/dataGet'

/**
 * Methods that support higher-order messages on a collection.
 * Mirrors Laravel's `proxies` array on Collection.php.
 */
export const HIGHER_ORDER_TARGETS = [
  'average',
  'avg',
  'contains',
  'doesntContain',
  'each',
  'every',
  'filter',
  'first',
  'flatMap',
  'groupBy',
  'keyBy',
  'map',
  'max',
  'min',
  'partition',
  'reject',
  'skipUntil',
  'skipWhile',
  'some',
  'sortBy',
  'sortByDesc',
  'sum',
  'takeUntil',
  'takeWhile',
  'unique'
] as const

export type HigherOrderTarget = (typeof HIGHER_ORDER_TARGETS)[number]

type AnyMethod = (...args: readonly unknown[]) => unknown
type AnyCallable = (...args: readonly unknown[]) => unknown

interface HigherOrderHost {
  [key: string]: unknown
}

/**
 * Build a proxy so `collection.each.foo()` becomes
 * `collection.each(item => item.foo())`, and `collection.sum.votes` becomes
 * `collection.sum(item => item.votes)`.
 *
 * Returns a Proxy<T> — calling a method on it produces the corresponding
 * shorthand callback wired into the host method.
 */
export function createHigherOrderProxy<T extends object, H extends HigherOrderHost>(
  host: H,
  method: HigherOrderTarget
): T {
  const targetMethod = host[method]
  if (typeof targetMethod !== 'function') {
    throw new TypeError(`Higher-order proxy: method "${method}" not found on host.`)
  }
  const hostMethod = targetMethod as AnyMethod
  return new Proxy(
    {},
    {
      get(_outerTarget, prop: string | symbol) {
        // Reference the (unused) handler arg so lint sees it as live.
        void _outerTarget
        const accessor = (item: unknown): unknown => {
          if (item == null) return undefined
          const value = (item as Record<string | symbol, unknown>)[prop]
          if (typeof value === 'function') return (value as AnyCallable).bind(item)
          if (typeof prop === 'string') return dataGet(item, prop)
          return value
        }
        return new Proxy(accessor as unknown as object, {
          // Calling `collection.each.foo(arg1, arg2)` — invoke method on each item.
          apply(_innerTarget, _thisArg, argArray: unknown[]) {
            void _innerTarget
            void _thisArg
            return hostMethod.call(host, (item: unknown) => {
              const fn = accessor(item)
              if (typeof fn === 'function') return (fn as AnyCallable)(...argArray)
              return fn
            })
          },
          // Bare property access like `collection.sum.votes` — pluck the value.
          get(_innerTarget, _innerProp) {
            void _innerTarget
            void _innerProp
            return hostMethod.call(host, accessor)
          }
        }) as unknown as T
      }
    }
  ) as T
}
