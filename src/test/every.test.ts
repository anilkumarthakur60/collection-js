import { collect } from '../collect'

describe('every', () => {
  it('returns true when all items match predicate', () => {
    expect(collect([2, 4, 6]).every((v) => v % 2 === 0)).toBe(true)
  })

  it('returns false when any item does not match', () => {
    expect(collect([2, 3, 6]).every((v) => v % 2 === 0)).toBe(false)
  })

  it('returns true for empty collection', () => {
    expect(collect([]).every(() => false)).toBe(true)
  })

  it('passes index to predicate', () => {
    expect(collect([0, 1, 2]).every((_v, i) => i >= 0)).toBe(true)
  })

  it('works with objects', () => {
    const items = [{ active: true }, { active: true }]
    expect(collect(items).every((v) => v.active)).toBe(true)
  })

  it('returns false when first item fails', () => {
    expect(collect([1, 2, 3]).every((v) => v > 1)).toBe(false)
  })
})

describe('some', () => {
  it('returns true when at least one item matches', () => {
    expect(collect([1, 2, 3]).some((v) => v === 2)).toBe(true)
  })

  it('returns false when no items match', () => {
    expect(collect([1, 2, 3]).some((v) => v > 10)).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).some(() => true)).toBe(false)
  })

  it('works with objects', () => {
    const items = [{ active: false }, { active: true }]
    expect(collect(items).some((v) => v.active)).toBe(true)
  })

  it('returns true when first item matches', () => {
    expect(collect([5, 1, 2]).some((v) => v === 5)).toBe(true)
  })

  it('returns true when last item matches', () => {
    expect(collect([1, 2, 5]).some((v) => v === 5)).toBe(true)
  })
})
