export function rangeOf(start: number, end: number, step: number = 1): number[] {
  if (step === 0) throw new RangeError('range step must not be zero')
  const ascending = step > 0
  const out: number[] = []
  if (ascending) {
    for (let i = start; i <= end; i += step) out.push(i)
  } else {
    for (let i = start; i >= end; i += step) out.push(i)
  }
  return out
}

export function timesOf<T>(count: number, factory: (n: number) => T): T[] {
  const out: T[] = new Array(count)
  for (let i = 0; i < count; i++) out[i] = factory(i + 1)
  return out
}

export function multiplyOf<T>(items: readonly T[], factor: number): T[] {
  if (factor <= 0) return []
  const out: T[] = []
  for (let i = 0; i < factor; i++) out.push(...items)
  return out
}

export function padOf<T>(items: readonly T[], size: number, value: T): T[] {
  const target = Math.abs(size)
  if (items.length >= target) return [...items]
  const padding = new Array<T>(target - items.length).fill(value)
  return size < 0 ? [...padding, ...items] : [...items, ...padding]
}
