import { dataGet } from '@/support/dataGet'

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

type AnyCallable = (this: unknown, ...args: readonly unknown[]) => unknown

/**
 * Targets whose property form is a *deferred invoker* rather than an eager
 * evaluation: `collection.each.notify(...)` calls `notify(...)` on every item
 * when the returned function is invoked. All other targets evaluate eagerly on
 * property access (`collection.map.name` → `collection.map(item => item.name)`).
 */
const DEFERRED_INVOKE_TARGETS: ReadonlySet<HigherOrderTarget> = new Set(['each'])

/**
 * Resolve `prop` on an item for a higher-order message. Methods are bound to
 * the item so `collection.each.notify()` invokes them with the right `this`;
 * plain values go through `dataGet` so dotted paths keep working.
 */
function accessMember(item: unknown, prop: string): unknown {
  if (item == null) return undefined
  const direct = (item as Record<string, unknown>)[prop]
  if (typeof direct === 'function') return (direct as AnyCallable).bind(item)
  return dataGet(item, prop)
}

/**
 * Build the callable higher-order proxy for one collection method.
 *
 * The returned value is a function, so the ordinary call form is untouched:
 * `collection.map(fn)`, `collection.filter()`, `collection.contains(x)` all
 * behave exactly like the wrapped method. In addition, *string property
 * access* is intercepted to implement Laravel's higher-order messages:
 *
 * - Eager targets — `collection.map.name` runs `map(item => item.name)` at
 *   access time and returns the real result (a Collection, boolean, Record…),
 *   so the value can be used directly: `collection.every.active === true`.
 * - Deferred targets (currently only `each`) — `collection.each.notify(...)`
 *   returns a function from the property access; invoking it calls
 *   `each(item => item.notify(...))`, matching the README example.
 *
 * NOTE: because property access is the message syntax, `Function.prototype`
 * members (`name`, `length`, `call`, `bind`…) are shadowed on the returned
 * proxy — exactly what makes `collection.map.name` pluck `name` instead of
 * returning the method's own name. Symbol properties pass through untouched.
 * The property form is not modelled in the TypeScript signatures (the getters
 * keep the plain callable type); cast at the access site when using it from TS.
 */
export function createHigherOrderProxy<F extends (...args: never[]) => unknown>(
  host: object,
  method: HigherOrderTarget,
  implementation?: (this: unknown, ...args: readonly unknown[]) => unknown
): F {
  const resolved = implementation ?? (host as Record<string, unknown>)[method]
  if (typeof resolved !== 'function') {
    throw new TypeError(`Higher-order proxy: method "${method}" not found on host.`)
  }
  const impl = resolved as AnyCallable
  const deferred = DEFERRED_INVOKE_TARGETS.has(method)

  // `Reflect.apply` (not `impl.call`) so this also works when `impl` is itself
  // a property-intercepting proxy — e.g. Collection's aggregation getters, for
  // which `.call` would be swallowed by their own higher-order get trap.
  const forwarder = function (this: unknown, ...args: readonly unknown[]): unknown {
    return Reflect.apply(impl, host, args as unknown[])
  }

  return new Proxy(forwarder, {
    get(target, prop, receiver): unknown {
      if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver) as unknown
      if (deferred) {
        return (...args: readonly unknown[]) =>
          Reflect.apply(impl, host, [
            (item: unknown) => {
              const member = accessMember(item, prop)
              return typeof member === 'function' ? (member as AnyCallable)(...args) : member
            }
          ])
      }
      return Reflect.apply(impl, host, [(item: unknown) => accessMember(item, prop)])
    }
  }) as unknown as F
}

/**
 * Replace every own prototype *method* named in `targets` with a getter that
 * returns its higher-order proxy. Aggregation getters that already implement
 * their own proxy (e.g. `Collection.sum`) are accessor properties and are
 * skipped; methods missing from the prototype are skipped too, so the same
 * call works for both `Collection` and `LazyCollection`.
 */
export function wireHigherOrderMessages(
  proto: object,
  targets: readonly HigherOrderTarget[] = HIGHER_ORDER_TARGETS
): void {
  for (const method of targets) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, method)
    if (!descriptor || typeof descriptor.value !== 'function') continue
    const original = descriptor.value as AnyCallable
    Object.defineProperty(proto, method, {
      configurable: true,
      enumerable: false,
      get(this: object): AnyCallable {
        return createHigherOrderProxy<AnyCallable>(this, method, original)
      }
    })
  }
}
