import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'

function toNumberArray<T>(items: readonly T[], by?: RetrieverInput<T, number>): number[] {
  const get = valueRetriever<T, number>(by)
  const out: number[] = []
  for (let i = 0; i < items.length; i++) {
    const v = get(items[i], i)
    const n = typeof v === 'number' ? v : Number(v)
    if (Number.isFinite(n)) out.push(n)
  }
  return out
}

/** Population variance (divides by N). For sample variance, use `sampleVarianceOf`. */
export function varianceOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, number>
): number | undefined {
  const values = toNumberArray(items, by)
  if (values.length === 0) return undefined
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  let acc = 0
  for (const v of values) acc += (v - mean) ** 2
  return acc / values.length
}

/** Sample variance (divides by N-1). Returns `undefined` for fewer than 2 samples. */
export function sampleVarianceOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, number>
): number | undefined {
  const values = toNumberArray(items, by)
  if (values.length < 2) return undefined
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  let acc = 0
  for (const v of values) acc += (v - mean) ** 2
  return acc / (values.length - 1)
}

export function stddevOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, number>
): number | undefined {
  const v = varianceOf(items, by)
  return v === undefined ? undefined : Math.sqrt(v)
}

export function sampleStddevOf<T>(
  items: readonly T[],
  by?: RetrieverInput<T, number>
): number | undefined {
  const v = sampleVarianceOf(items, by)
  return v === undefined ? undefined : Math.sqrt(v)
}

/**
 * Quantile via linear interpolation between closest ranks (matches numpy/R type 7).
 * `q` is in [0, 1]. Returns undefined for empty input.
 */
export function quantileOf<T>(
  items: readonly T[],
  q: number,
  by?: RetrieverInput<T, number>
): number | undefined {
  if (q < 0 || q > 1) throw new RangeError(`quantile q must be in [0,1] (got ${q})`)
  const values = toNumberArray(items, by).sort((a, b) => a - b)
  if (values.length === 0) return undefined
  if (values.length === 1) return values[0]
  const pos = q * (values.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return values[lo]
  return values[lo] + (values[hi] - values[lo]) * (pos - lo)
}

export function percentileOf<T>(
  items: readonly T[],
  p: number,
  by?: RetrieverInput<T, number>
): number | undefined {
  return quantileOf(items, p / 100, by)
}

export interface HistogramBin {
  count: number
  /** Lower bound (inclusive). */
  from: number
  /** Upper bound (exclusive, except for the last bin which is inclusive). */
  to: number
}

/**
 * Equal-width histogram with `bins` buckets. `range` is auto-computed when
 * not supplied. Empty input returns an empty array.
 */
export function histogramOf<T>(
  items: readonly T[],
  bins: number,
  options: { by?: RetrieverInput<T, number>; range?: readonly [number, number] } = {}
): HistogramBin[] {
  if (bins <= 0 || !Number.isInteger(bins)) {
    throw new RangeError(`bins must be a positive integer (got ${bins})`)
  }
  const values = toNumberArray(items, options.by)
  if (values.length === 0) return []

  const [min, max] = options.range ?? [Math.min(...values), Math.max(...values)]
  if (min === max) return [{ from: min, to: max, count: values.length }]

  const width = (max - min) / bins
  const out: HistogramBin[] = Array.from({ length: bins }, (_, i) => ({
    from: min + i * width,
    to: min + (i + 1) * width,
    count: 0
  }))
  for (const v of values) {
    if (v < min || v > max) continue
    const idx = v === max ? bins - 1 : Math.floor((v - min) / width)
    out[idx].count++
  }
  return out
}

/** Pearson correlation between two numeric extractors over the same items. */
export function correlationOf<T>(
  items: readonly T[],
  xBy: RetrieverInput<T, number>,
  yBy: RetrieverInput<T, number>
): number | undefined {
  if (items.length < 2) return undefined
  const xs = toNumberArray(items, xBy)
  const ys = toNumberArray(items, yBy)
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return undefined
  let xSum = 0
  let ySum = 0
  for (let i = 0; i < n; i++) {
    xSum += xs[i]
    ySum += ys[i]
  }
  const xMean = xSum / n
  const yMean = ySum / n
  let cov = 0
  let xVar = 0
  let yVar = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean
    const dy = ys[i] - yMean
    cov += dx * dy
    xVar += dx * dx
    yVar += dy * dy
  }
  const denom = Math.sqrt(xVar * yVar)
  return denom === 0 ? undefined : cov / denom
}
