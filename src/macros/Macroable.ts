import type { MacroFn } from '../contracts/Macroable'

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
 * Mix the static `macro`, `hasMacro`, and `flushMacros` methods onto a class.
 * Used by `Collection` and `LazyCollection`. Avoids inheritance gymnastics.
 */
export interface MacroableTarget {
  flushMacros(): void
  hasMacro(name: string): boolean
  macro(name: string, fn: MacroFn): void
}

export function applyMacroable<C extends MacroableClass>(
  target: C
): asserts target is C & MacroableTarget {
  const t = target as unknown as MacroableTarget
  t.macro = (name: string, fn: MacroFn) => registerMacro(target, name, fn)
  t.hasMacro = (name: string) => hasMacro(target, name)
  t.flushMacros = () => flushMacros(target)
}
