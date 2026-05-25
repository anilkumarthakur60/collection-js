import { deepEqual, looseEqual } from './deepEqual'
import type { Operator } from './types'

/** Compare two values using a Laravel-style operator string. */
export function operatorForWhere(retrieved: unknown, operator: Operator, value: unknown): boolean {
  switch (operator) {
    case '=':
    case '==':
      return looseEqual(retrieved, value)
    case '===':
      return retrieved === value || deepEqual(retrieved, value)
    case '!=':
    case '<>':
      return !looseEqual(retrieved, value)
    case '!==':
      return retrieved !== value && !deepEqual(retrieved, value)
    case '<':
      return (retrieved as number) < (value as number)
    case '<=':
      return (retrieved as number) <= (value as number)
    case '>':
      return (retrieved as number) > (value as number)
    case '>=':
      return (retrieved as number) >= (value as number)
    default: {
      const exhaustive: never = operator
      throw new Error(`Unsupported operator: ${String(exhaustive)}`)
    }
  }
}

export function isOperator(value: unknown): value is Operator {
  return (
    value === '=' ||
    value === '==' ||
    value === '===' ||
    value === '!=' ||
    value === '!==' ||
    value === '<>' ||
    value === '<' ||
    value === '<=' ||
    value === '>' ||
    value === '>='
  )
}
