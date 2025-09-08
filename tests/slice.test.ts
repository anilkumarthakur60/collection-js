import { collect } from '../src/collect'

describe('slice', () => {
  it('slices from start index to end', () => {
    expect(collect([1, 2, 3, 4, 5]).slice(2).all()).toEqual([3, 4, 5])
  })

  it('slices with length', () => {
    expect(collect([1, 2, 3, 4, 5]).slice(1, 3).all()).toEqual([2, 3, 4])
  })

  it('slices from beginning with length', () => {
    expect(collect([1, 2, 3, 4, 5]).slice(0, 2).all()).toEqual([1, 2])
  })

  it('returns empty when start is beyond length', () => {
    expect(collect([1, 2, 3]).slice(10).all()).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).slice(0, 3).all()).toEqual([])
  })

  it('does not mutate original', () => {
    const c = collect([1, 2, 3])
    c.slice(1)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('slices with length of 0 returns empty', () => {
    expect(collect([1, 2, 3]).slice(1, 0).all()).toEqual([])
  })

  it('slices single item', () => {
    expect(collect([1, 2, 3]).slice(2, 1).all()).toEqual([3])
  })
})
