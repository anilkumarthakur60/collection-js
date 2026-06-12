import type { MacroFn } from '@/contracts/Macroable'

/**
 * A reference to a class. We accept both regular and abstract constructors
 * because some abstract base classes may also be macroable.
 */
export type MacroableClass = abstract new (...args: never[]) => unknown

/**
 * Per-class registry. Each Macroable subclass owns its own Map keyed off the
 * constructor reference, so Collection macros and LazyCollection macros do not
 * collide. Lookup walks the prototype chain so a parent's macros are inherited.
 */
const REGISTRY = new WeakMap<MacroableClass, Map<string, MacroFn>>()

function ownMap(target: MacroableClass): Map<string, MacroFn> {
  let map = REGISTRY.get(target)
  if (!map) {
    map = new Map<string, MacroFn>()
    REGISTRY.set(target, map)
  }
  return map
}

function lookup(target: MacroableClass, name: string): MacroFn | undefined {
  let cursor: MacroableClass | null = target
  while (cursor) {
    const map = REGISTRY.get(cursor)
    const fn = map?.get(name)
    if (fn) return fn
    cursor = Object.getPrototypeOf(cursor) as MacroableClass | null
  }
  return undefined
}

/**
 * Register `fn` as a macro named `name` on `target`.
 *
 * GLOBAL BY DESIGN: the macro is installed on `target.prototype`, which is
 * shared by every instance of that class in the running realm — exactly like
 * Laravel's `Collection::macro()`. Two consequences worth knowing:
 *
 * - Any module (including a transitive dependency) that registers a macro
 *   changes behavior for the whole application. Libraries that need private
 *   extensions should subclass instead:
 *   `class MyCollection extends Collection {}` + `applyMacroable(MyCollection)`
 *   scopes macros to the subclass (instances still inherit parent macros via
 *   the prototype-chain lookup).
 * - Two copies of this package (e.g. the CDN IIFE plus the npm ESM build, or
 *   duplicated versions in node_modules) have distinct classes — a macro
 *   registered on one copy does not exist on the other.
 *
 * TypeScript: macros are invisible to the compiler by default. Declare them
 * via module augmentation next to your registration:
 *
 * ```ts
 * declare module '@anil-labs/collection-js' {
 *   interface Collection<T> {
 *     toUpper(this: Collection<string>): Collection<string>
 *   }
 * }
 * ```
 */
export function registerMacro(target: MacroableClass, name: string, fn: MacroFn): void {
  ownMap(target).set(name, fn)
  // Install on the prototype so direct property access still works in JS-land.
  Object.defineProperty(target.prototype as object, name, {
    value: function (this: unknown, ...args: unknown[]) {
      return fn.call(this, ...args)
    },
    configurable: true,
    writable: true,
    enumerable: false
  })
}

export function hasMacro(target: MacroableClass, name: string): boolean {
  return lookup(target, name) !== undefined
}

export function getMacro(target: MacroableClass, name: string): MacroFn | undefined {
  return lookup(target, name)
}

export function flushMacros(target: MacroableClass): void {
  const map = REGISTRY.get(target)
  if (!map) return
  for (const name of map.keys()) {
    delete (target.prototype as Record<string, unknown>)[name]
  }
  map.clear()
}

/**
 * Static surface mixed onto a macroable class (`Collection`, `LazyCollection`,
 * or your own subclass via {@link applyMacroable}).
 *
 * `macro` is typed generically so a callback with a concrete `this` type and
 * typed parameters registers without casts:
 *
 * ```ts
 * Collection.macro('toUpper', function (this: Collection<string>) {
 *   return this.map((s) => s.toUpperCase())
 * })
 * ```
 *
 * Registration is app-global (see {@link registerMacro}); pair it with module
 * augmentation so call sites are typed.
 */
export interface MacroableTarget {
  flushMacros(): void
  getMacro(name: string): MacroFn | undefined
  hasMacro(name: string): boolean
  macro<A extends readonly unknown[], R>(name: string, fn: (this: never, ...args: A) => R): void
}

/**
 * Mix the static `macro`, `hasMacro`, `getMacro`, and `flushMacros` methods
 * onto a class. Used by `Collection` and `LazyCollection`; call it on your own
 * subclass to give it a macro registry of its own (instances still inherit the
 * parent's macros through the prototype-chain lookup).
 */
export function applyMacroable<C extends MacroableClass>(
  target: C
): asserts target is C & MacroableTarget {
  const t = target as unknown as MacroableTarget
  t.macro = (name, fn) => registerMacro(target, name, fn as unknown as MacroFn)
  t.hasMacro = (name: string) => hasMacro(target, name)
  t.getMacro = (name: string) => getMacro(target, name)
  t.flushMacros = () => flushMacros(target)
}
