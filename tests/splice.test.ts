import { collect } from '../src'

describe('splice', () => {
  it('removes items from start to end', () => {
    expect(collect([1, 2, 3, 4, 5]).splice(2).all()).toEqual([1, 2])
  })

  it('removes specified number of items', () => {
    expect(collect([1, 2, 3, 4, 5]).splice(1, 2).all()).toEqual([1, 4, 5])
  })

  it('inserts items at position', () => {
    expect(collect([1, 2, 5]).splice(2, 0, 3, 4).all()).toEqual([1, 2, 3, 4, 5])
  })

  it('replaces items', () => {
    expect(collect([1, 2, 3]).splice(1, 1, 99).all()).toEqual([1, 99, 3])
  })

  it('does not mutate original collection', () => {
    const c = collect([1, 2, 3])
    c.splice(1, 1)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('works at index 0', () => {
    expect(collect([1, 2, 3]).splice(0, 1).all()).toEqual([2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).splice(0).all()).toEqual([])
  })

  it('splice with start beyond length returns same collection', () => {
    expect(collect([1, 2, 3]).splice(10).all()).toEqual([1, 2, 3])
  })
})
