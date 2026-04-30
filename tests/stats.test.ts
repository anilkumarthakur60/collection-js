import { collect } from '../src'

describe('stats', () => {
  const xs = collect([2, 4, 4, 4, 5, 5, 7, 9])

  it('variance (population)', () => {
    expect(xs.variance()).toBe(4)
  })

  it('sampleVariance', () => {
    expect(xs.sampleVariance()).toBeCloseTo(4.571, 3)
  })

  it('stddev (population)', () => {
    expect(xs.stddev()).toBe(2)
  })

  it('sampleStddev', () => {
    expect(xs.sampleStddev()).toBeCloseTo(2.138, 3)
  })

  it('quantile / median', () => {
    expect(xs.quantile(0.5)).toBe(4.5)
    expect(xs.quantile(0)).toBe(2)
    expect(xs.quantile(1)).toBe(9)
  })

  it('percentileAt', () => {
    expect(xs.percentileAt(75)).toBe(5.5)
  })

  it('quantile rejects out-of-range q', () => {
    expect(() => xs.quantile(1.1)).toThrow(RangeError)
  })

  it('histogram with auto range', () => {
    const bins = collect([1, 2, 3, 4, 5, 6, 7, 8]).histogram(4)
    expect(bins).toHaveLength(4)
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(8)
  })

  it('histogram with explicit range', () => {
    const bins = collect([0, 1, 2, 3, 4, 5]).histogram(2, { range: [0, 4] })
    expect(bins[0]).toEqual({ from: 0, to: 2, count: 2 })
    // Last bin is inclusive at upper bound; values outside the range are skipped (5 is dropped).
    expect(bins[1]).toEqual({ from: 2, to: 4, count: 3 })
  })

  it('correlation between two extractors', () => {
    const items = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ]
    expect(collect(items).correlation('x', 'y')).toBeCloseTo(1, 5)
  })

  it('returns undefined on empty input', () => {
    expect(collect<number>([]).variance()).toBeUndefined()
    expect(collect<number>([]).stddev()).toBeUndefined()
    expect(collect<number>([]).quantile(0.5)).toBeUndefined()
  })
})
