export type MacroFn = (this: unknown, ...args: readonly unknown[]) => unknown

export interface MacroableStatic {
  flushMacros(): void
  hasMacro(name: string): boolean
  macro(name: string, fn: MacroFn): void
}
