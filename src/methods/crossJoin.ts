export function crossJoin<T, U>(items: T[], ...arrays: U[][]): (T | U)[][] {
  const result: (T | U)[][] = []

  const helper = (current: (T | U)[], depth: number): void => {
    if (depth === arrays.length) {
      result.push(current)
      return
    }

    for (const value of arrays[depth]) {
      helper([...current, value], depth + 1)
    }
  }

  for (const item of items) {
    helper([item], 0)
  }

  return result
}
