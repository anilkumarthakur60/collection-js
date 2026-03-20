import { collect } from '../src/collect'

describe('search', () => {
  it('returns index of found value', () => {
    expect(collect([1, 2, 3]).search(2)).toBe(1)
  })

  it('returns 0 for first item', () => {
    expect(collect([10, 20, 30]).search(10)).toBe(0)
  })

  it('returns false when value not found', () => {
    expect(collect([1, 2, 3]).search(99)).toBe(false)
  })

  it('uses loose comparison by default', () => {
    expect(collect([1, 2, 3]).search('2' as unknown as number)).toBe(1)
  })

  it('returns false with strict comparison on type mismatch', () => {
    expect(collect([1, 2, 3]).search('2' as unknown as number, true)).toBe(false)
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).search('c')).toBe(2)
  })

  it('works with callback predicate', () => {
    expect(collect([1, 2, 3, 4]).search((v) => v > 2)).toBe(2)
  })

  it('callback returns false when predicate never matches', () => {
    expect(collect([1, 2, 3]).search((v) => v > 10)).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).search(1)).toBe(false)
  })

  it('strict mode finds correctly typed item', () => {
    expect(collect([1, 2, 3]).search(3, true)).toBe(2)
  })
})
