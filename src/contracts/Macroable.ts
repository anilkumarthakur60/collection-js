export type MacroFn = (this: unknown, ...args: readonly unknown[]) => unknown

export interface MacroableStatic {
  macro(name: string, fn: MacroFn): void
  hasMacro(name: string): boolean
  flushMacros(): void
}
