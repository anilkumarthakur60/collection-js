import { dataGet } from '../support/dataGet'

export function implodeOf<T>(
  items: readonly T[],
  glueOrFormatter: string | ((item: T, index: number) => string),
  separatorIfFormatter?: string,
  key?: string
): string {
  if (typeof glueOrFormatter === 'function') {
    const sep = separatorIfFormatter ?? ''
    return items.map((item, i) => glueOrFormatter(item, i)).join(sep)
  }
  if (key !== undefined) {
    return items.map((item) => String(dataGet(item, key) ?? '')).join(glueOrFormatter)
  }
  return items.map((item) => String(item ?? '')).join(glueOrFormatter)
}

export function joinOf<T>(items: readonly T[], glue: string, finalGlue?: string): string {
  const stringified = items.map((item) => String(item ?? ''))
  if (finalGlue === undefined || stringified.length <= 1) return stringified.join(glue)
  const head = stringified.slice(0, -1).join(glue)
  return `${head}${finalGlue}${stringified[stringified.length - 1]}`
}
