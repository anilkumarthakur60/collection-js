import { collect, operations } from '../src'

// Audit fix: "Numeric coercion inconsistent between aggregations.ts and stats.ts".
// The library now has ONE documented rule (see coerceNumeric in aggregations.ts):
// finite numbers / numeric strings / booleans participate, everything else
// (null, undefined, NaN, ±Infinity, non-numeric or empty strings, objects) is
// skipped — never silently treated as 0 — in sum/average/median AND every stat.
describe('regression: numeric coercion unified between aggregations and stats', () => {
  it('average, median and variance describe the same population for mixed data', () => {
    const mixed = collect<unknown>(['x', 2])
    // Previously: average() === 1 and median() === 1 ('x' coerced to 0) while
    // variance() === 0 ('x' dropped) — statistically incoherent.
    expect(mixed.average()).toBe(2)
    expect(mixed.median()).toBe(2)
    expect(mixed.variance()).toBe(0)
    expect(mixed.stddev()).toBe(0)
  })

  it('sum coerces numeric strings and booleans, skips everything non-numeric', () => {
    expect(collect<unknown>(['1', '2', true]).sum()).toBe(4)
    expect(collect<unknown>(['abc', null, undefined, {}, '']).sum()).toBe(0)
    expect(collect([1, NaN, 2]).sum()).toBe(3)
    expect(collect([1, Infinity]).sum()).toBe(1)
  })

  it('average divides by the count of numeric values only (Laravel avg semantics)', () => {
    expect(collect<unknown>([1, 2, null]).average()).toBe(1.5)
    expect(collect<unknown>(['x']).average()).toBe(0)
    expect(collect([]).average()).toBe(0)
  })

  it('median skips non-numeric values and returns undefined when none remain', () => {
    expect(collect<unknown>([5, 'x', 1, null, 3]).median()).toBe(3)
    expect(collect<unknown>(['x', null]).median()).toBeUndefined()
  })

  it('stats skip null and empty strings instead of treating them as 0', () => {
    // Previously stats coerced null/'' via Number() to 0 and included them.
    expect(collect<unknown>([null, 2, 4]).variance()).toBe(1)
    expect(collect<unknown>(['', 2, 4]).stddev()).toBe(1)
    expect(collect<unknown>(['x', 2]).quantile(0.5)).toBe(2)
  })

  it('numeric strings and booleans participate in stats', () => {
    expect(collect<unknown>(['2', 4]).variance()).toBe(1)
    expect(collect<unknown>([true, false]).sum()).toBe(1)
  })

  it('max/min skip NaN but keep ±Infinity and preserve value types', () => {
    expect(collect([3, NaN, 7]).max()).toBe(7)
    expect(collect([NaN, 3]).min()).toBe(3)
    expect(collect([NaN]).max()).toBeUndefined()
    expect(collect([1, Infinity]).max()).toBe(Infinity)
    expect(collect([-Infinity, 1]).min()).toBe(-Infinity)
  })

  it('mode counts raw values by identity without numeric coercion', () => {
    expect(collect<unknown>([1, '1', 1]).mode()).toEqual([1])
  })

  describe('coerceNumeric / numericValuesOf helpers', () => {
    it('coerceNumeric implements the documented rule', () => {
      expect(operations.coerceNumeric(2.5)).toBe(2.5)
      expect(operations.coerceNumeric('42')).toBe(42)
      expect(operations.coerceNumeric(' 3 ')).toBe(3)
      expect(operations.coerceNumeric(true)).toBe(1)
      expect(operations.coerceNumeric(false)).toBe(0)
      expect(operations.coerceNumeric(NaN)).toBeUndefined()
      expect(operations.coerceNumeric(Infinity)).toBeUndefined()
      expect(operations.coerceNumeric(-Infinity)).toBeUndefined()
      expect(operations.coerceNumeric('')).toBeUndefined()
      expect(operations.coerceNumeric('  ')).toBeUndefined()
      expect(operations.coerceNumeric('abc')).toBeUndefined()
      expect(operations.coerceNumeric(null)).toBeUndefined()
      expect(operations.coerceNumeric(undefined)).toBeUndefined()
      expect(operations.coerceNumeric({})).toBeUndefined()
      expect(operations.coerceNumeric(new Date(5))).toBeUndefined()
    })

    it('numericValuesOf extracts values via a retriever and applies the rule', () => {
      const items = [{ v: '1' }, { v: 'x' }, { v: 2 }, { v: null }]
      expect(operations.numericValuesOf(items, 'v')).toEqual([1, 2])
      expect(operations.numericValuesOf(items, (item) => item.v)).toEqual([1, 2])
      expect(operations.numericValuesOf<number>([])).toEqual([])
    })
  })
})
