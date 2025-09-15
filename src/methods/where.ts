export function where<T, K extends keyof T>(
  items: T[],
  key: K,
  operatorOrValue: string | T[K],
  value?: T[K]
): T[] {
  if (value === undefined) {
    return items.filter((item) => item[key] === operatorOrValue)
  }
  const operator = operatorOrValue as string
  return items.filter((item) => {
    switch (operator) {
      case '=':
      case '==':
        return item[key] == value
      case '===':
        return item[key] === value
      case '!=':
      case '<>':
        return item[key] != value
      case '!==':
        return item[key] !== value
      case '<':
        return item[key] < value!
      case '<=':
        return item[key] <= value!
      case '>':
        return item[key] > value!
      case '>=':
        return item[key] >= value!
      default:
        return item[key] === value
    }
  })
}

export function whereBetween<T, K extends keyof T>(items: T[], key: K, min: T[K], max: T[K]): T[] {
  return items.filter((item) => item[key] >= min && item[key] <= max)
}

export function whereIn<T, K extends keyof T>(items: T[], key: K, values: T[K][]): T[] {
  return items.filter((item) => values.includes(item[key]))
}

export function whereNotBetween<T, K extends keyof T>(
  items: T[],
  key: K,
  min: T[K],
  max: T[K]
): T[] {
  return items.filter((item) => item[key] < min || item[key] > max)
}

export function whereNotIn<T, K extends keyof T>(items: T[], key: K, values: T[K][]): T[] {
  return items.filter((item) => !values.includes(item[key]))
}

export function whereNotNull<T, K extends keyof T>(items: T[], key: K): T[] {
  return items.filter((item) => item[key] !== null && item[key] !== undefined)
}

export function whereNull<T, K extends keyof T>(items: T[], key: K): T[] {
  return items.filter((item) => item[key] === null || item[key] === undefined)
}
