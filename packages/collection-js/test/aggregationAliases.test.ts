import { collect } from '../src'

describe('instance aggregation aliases (audit: sumBy/averageBy/avgBy/maxBy/minBy untested)', () => {
  const orders = [
    { total: 10, customer: { spend: 100 } },
    { total: 30, customer: { spend: 50 } },
    { total: 20, customer: { spend: 75 } }
  ]

  it('sumBy supports key, dot-path, callback, and empty input', () => {
    expect(collect(orders).sumBy('total')).toBe(60)
    expect(collect(orders).sumBy('customer.spend')).toBe(225)
    expect(collect(orders).sumBy((o) => o.total * 2)).toBe(120)
    expect(collect<{ total: number }>([]).sumBy('total')).toBe(0)
    expect(collect([1, 2, 3]).sumBy()).toBe(6)
  })

  it('averageBy and avgBy agree and skip non-numeric values', () => {
    expect(collect(orders).averageBy('total')).toBe(20)
    expect(collect(orders).avgBy('total')).toBe(20)
    expect(collect(orders).avgBy((o) => o.customer.spend)).toBe(75)
    expect(collect<{ total: number }>([]).averageBy('total')).toBe(0)
  })

  it('maxBy/minBy support key, dot-path, callback, and empty input', () => {
    expect(collect(orders).maxBy('total')).toBe(30)
    expect(collect(orders).minBy('total')).toBe(10)
    expect(collect(orders).maxBy('customer.spend')).toBe(100)
    expect(collect(orders).minBy((o) => o.total)).toBe(10)
    expect(collect<{ total: number }>([]).maxBy('total')).toBeUndefined()
    expect(collect<{ total: number }>([]).minBy('total')).toBeUndefined()
  })
})

describe('max/min ordering across value types (audit: compareForExtent Date/bigint/mixed untested)', () => {
  it('orders Dates by their natural timeline', () => {
    const early = new Date('2020-01-01')
    const late = new Date('2024-01-01')
    expect(collect([late, early]).maxBy((d) => d)).toBe(late)
    expect(collect([late, early]).minBy((d) => d)).toBe(early)
  })

  it('orders bigints by magnitude', () => {
    expect(collect([2n, 10n, 5n]).maxBy((b) => b)).toBe(10n)
    expect(collect([2n, 10n, 5n]).minBy((b) => b)).toBe(2n)
    expect(collect([3n, 3n]).maxBy((b) => b)).toBe(3n)
  })

  it('mixed numeric strings and numbers compare numerically, not lexically', () => {
    // Lexically '10' < '9'; numerically 10 > 9 — the numeric rule wins.
    expect(collect<unknown>(['10', 9]).maxBy((v) => v)).toBe('10')
    expect(collect<unknown>(['10', 9]).minBy((v) => v)).toBe(9)
  })

  it('non-numeric mixed values fall back to string comparison', () => {
    expect(collect<unknown>(['b', { toString: () => 'a' }]).maxBy((v) => v)).toBe('b')
  })

  it('strings compare lexicographically when all values are strings', () => {
    expect(collect(['pear', 'apple', 'zed']).maxBy((s) => s)).toBe('zed')
    expect(collect(['pear', 'apple', 'zed']).minBy((s) => s)).toBe('apple')
  })
})
