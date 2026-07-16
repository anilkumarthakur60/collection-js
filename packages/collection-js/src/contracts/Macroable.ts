/**
 * Runtime shape of a registered macro as stored in the registry. Callbacks
 * passed to `macro()` may use concrete `this`/parameter types — they are
 * erased to this shape internally.
 */
export type MacroFn = (this: unknown, ...args: readonly unknown[]) => unknown

/**
 * Static macro surface exposed by macroable classes. Mirrors
 * `MacroableTarget` in `@/macros/Macroable` — see there for the typed
 * registration recipe and the module-augmentation story.
 */
export interface MacroableStatic {
  flushMacros(): void
  getMacro(name: string): MacroFn | undefined
  hasMacro(name: string): boolean
  macro<A extends readonly unknown[], R>(name: string, fn: (this: never, ...args: A) => R): void
}
