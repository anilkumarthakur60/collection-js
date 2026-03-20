export function flattenHelper(arr: unknown[], depth: number): unknown[] {
  if (depth < 1) return arr
  return arr.reduce((acc: unknown[], val: unknown) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...flattenHelper(val, depth - 1))
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}
