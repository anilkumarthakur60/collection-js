import { dataGet } from '../support/dataGet'
import { deepEqual, looseEqual } from '../support/deepEqual'
import { operatorForWhere, isOperator } from '../support/operatorForWhere'
import type { ClassConstructor, Operator, Predicate } from '../support/types'

export function filterOf<T>(items: readonly T[], predicate?: Predicate<T>): T[] {
  if (predicate === undefined) return items.filter((v) => Boolean(v))
  return items.filter((item, idx) => predicate(item, idx))
}

export function rejectOf<T>(items: readonly T[], predicate: Predicate<T>): T[] {
  return items.filter((item, idx) => !predicate(item, idx))
}

export interface WhereSpec {
  operator: Operator
  strict: boolean
  truthy: boolean
  value: unknown
}

export function buildWhereSpec(args: readonly unknown[], strict: boolean): WhereSpec {
  // args = [key] | [key, value] | [key, operator, value]
  if (args.length <= 1) return { truthy: true, operator: '=', value: undefined, strict }
  if (args.length >= 3 && isOperator(args[1])) {
    return { truthy: false, operator: args[1] as Operator, value: args[2], strict }
  }
  return { truthy: false, operator: strict ? '===' : '=', value: args[1], strict }
}

export function whereOf<T>(items: readonly T[], key: string, spec: WhereSpec): T[] {
  if (spec.truthy) return items.filter((item) => Boolean(dataGet(item, key)))
  return items.filter((item) => operatorForWhere(dataGet(item, key), spec.operator, spec.value))
}

export function whereInOf<T>(
  items: readonly T[],
  key: string,
  values: readonly unknown[],
  strict = false,
): T[] {
  return items.filter((item) => {
    const got = dataGet(item, key)
    return values.some((v) => (strict ? v === got || deepEqual(v, got) : looseEqual(v, got)))
  })
}

export function whereNotInOf<T>(
  items: readonly T[],
  key: string,
  values: readonly unknown[],
  strict = false,
): T[] {
  return items.filter((item) => {
    const got = dataGet(item, key)
    return !values.some((v) => (strict ? v === got || deepEqual(v, got) : looseEqual(v, got)))
  })
}

export function whereBetweenOf<T>(items: readonly T[], key: string, range: readonly [unknown, unknown]): T[] {
  const [lo, hi] = range
  return items.filter((item) => {
    const got = dataGet(item, key)
    return (got as number) >= (lo as number) && (got as number) <= (hi as number)
  })
}

export function whereNotBetweenOf<T>(items: readonly T[], key: string, range: readonly [unknown, unknown]): T[] {
  const [lo, hi] = range
  return items.filter((item) => {
    const got = dataGet(item, key)
    return (got as number) < (lo as number) || (got as number) > (hi as number)
  })
}

export function whereNullOf<T>(items: readonly T[], key: string): T[] {
  return items.filter((item) => dataGet(item, key) == null)
}

export function whereNotNullOf<T>(items: readonly T[], key: string): T[] {
  return items.filter((item) => dataGet(item, key) != null)
}

export function whereInstanceOfOf<T, R>(
  items: readonly T[],
  Ctor: ClassConstructor<R> | (abstract new (...args: never[]) => R),
): R[] {
  return items.filter((item) => item instanceof (Ctor as Function)) as unknown as R[]
}
