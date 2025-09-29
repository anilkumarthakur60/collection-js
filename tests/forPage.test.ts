import { collect } from '../src/collect'

describe('forPage', () => {
  it('returns correct page of items', () => {
    expect(collect([1, 2, 3, 4, 5, 6]).forPage(1, 2).all()).toEqual([1, 2])
  })

  it('returns second page', () => {
    expect(collect([1, 2, 3, 4, 5, 6]).forPage(2, 2).all()).toEqual([3, 4])
  })

  it('returns third page', () => {
    expect(collect([1, 2, 3, 4, 5, 6]).forPage(3, 2).all()).toEqual([5, 6])
  })

  it('returns partial page at end', () => {
    expect(collect([1, 2, 3, 4, 5]).forPage(2, 3).all()).toEqual([4, 5])
  })

  it('returns empty collection for out-of-range page', () => {
    expect(collect([1, 2, 3]).forPage(5, 2).all()).toEqual([])
  })

  it('returns all items on page 1 with large per-page', () => {
    expect(collect([1, 2, 3]).forPage(1, 100).all()).toEqual([1, 2, 3])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).forPage(1, 10).all()).toEqual([])
  })

  it('works with per-page of 1', () => {
    expect(collect([10, 20, 30]).forPage(3, 1).all()).toEqual([30])
  })
})
