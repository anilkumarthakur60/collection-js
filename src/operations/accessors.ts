import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'
import { MultipleItemsFoundException } from '../exceptions/MultipleItemsFoundException'
import { dataGet } from '../support/dataGet'
import { isObjectLike } from '../support/isObject'
import { looseEqual } from '../support/deepEqual'
import { operatorForWhere, isOperator } from '../support/operatorForWhere'
import type { Operator, Predicate } from '../support/types'

export function firstOf<T>(items: readonly T[], predicate?: Predicate<T>): T | undefined {
  if (predicate === undefined) return items.length > 0 ? items[0] : undefined
  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i], i)) return items[i]
  }
  return undefined
}

export function firstOrFailOf<T>(items: readonly T[], predicate?: Predicate<T>): T {
  const result = firstOf(items, predicate)
  if (result === undefined) throw new ItemNotFoundException()
  return result
}

export interface FirstWhereSpec {
  operator: Operator
  /** Truthy check on the key when both operator and value are absent. */
  truthy: boolean
  value: unknown
}

export function buildFirstWhereSpec(
  operatorOrValue: Operator | unknown,
  value: unknown,
  argCount: number,
): FirstWhereSpec {
  if (argCount <= 1) return { truthy: true, operator: '=', value: undefined }
  if (argCount >= 3 && isOperator(operatorOrValue)) {
    return { truthy: false, operator: operatorOrValue, value }
  }
  return { truthy: false, operator: '=', value: operatorOrValue }
}

export function firstWhereOf<T>(
  items: readonly T[],
  key: keyof T | string,
  spec: FirstWhereSpec,
): T | undefined {
  if (spec.truthy) return items.find((item) => Boolean(dataGet(item, String(key))))
  return items.find((item) => operatorForWhere(dataGet(item, String(key)), spec.operator, spec.value))
}

export function lastOf<T>(items: readonly T[], predicate?: Predicate<T>): T | undefined {
  if (predicate === undefined) return items.length > 0 ? items[items.length - 1] : undefined
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i], i)) return items[i]
  }
  return undefined
}

export function getAt<T>(items: readonly T[], index: number, defaultValue?: T): T | undefined {
  if (index < 0 && Math.abs(index) <= items.length) return items[items.length + index]
  if (index >= 0 && index < items.length) return items[index]
  return defaultValue
}

export function valueOfFirst<T, R = unknown>(items: readonly T[], key: string): R | undefined {
  if (items.length === 0) return undefined
  return dataGet(items[0], key) as R
}

export function soleOf<T>(
  items: readonly T[],
  predicate?: Predicate<T> | keyof T | string,
  expected?: unknown,
): T {
  let filter: Predicate<T>
  if (predicate === undefined) {
    filter = () => true
  } else if (typeof predicate === 'function') {
    filter = predicate
  } else {
    const key = String(predicate)
    filter = (item) => looseEqual(dataGet(item, key), expected)
  }

  const matched: T[] = []
  for (let i = 0; i < items.length; i++) {
    if (filter(items[i], i)) matched.push(items[i])
    if (matched.length > 1) throw new MultipleItemsFoundException(matched.length)
  }
  if (matched.length === 0) throw new ItemNotFoundException()
  return matched[0]
}

function resolveItem<T>(items: readonly T[], target: T | string | Predicate<T>, strict: boolean): number {
  if (typeof target === 'function') {
    return items.findIndex(target as Predicate<T>)
  }
  if (strict) return items.findIndex((item) => item === target)
  return items.findIndex((item) => looseEqual(item, target))
}

export function afterOf<T>(items: readonly T[], target: T | string | Predicate<T>, strict = false): T | undefined {
  const idx = resolveItem(items, target, strict)
  if (idx === -1 || idx === items.length - 1) return undefined
  return items[idx + 1]
}

export function beforeOf<T>(items: readonly T[], target: T | string | Predicate<T>, strict = false): T | undefined {
  const idx = resolveItem(items, target, strict)
  if (idx <= 0) return undefined
  return items[idx - 1]
}

export function hasKey<T>(items: readonly T[], keys: readonly (keyof T | string)[]): boolean {
  return keys.every((key) =>
    items.some((item) => isObjectLike(item) && Object.prototype.hasOwnProperty.call(item, String(key))),
  )
}

export function hasAnyKey<T>(items: readonly T[], keys: readonly (keyof T | string)[]): boolean {
  return keys.some((key) =>
    items.some((item) => isObjectLike(item) && Object.prototype.hasOwnProperty.call(item, String(key))),
  )
}
