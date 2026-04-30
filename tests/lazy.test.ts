import { collect, Collection, LazyCollection } from '../src'

describe('lazy', () => {
  it('returns a LazyCollection instance', () => {
    const lazy = collect([1, 2, 3]).lazy()
    expect(lazy).toBeInstanceOf(LazyCollection)
  })

  it('lazy collection has all items', () => {
    const lazy = collect([1, 2, 3]).lazy()
    expect(lazy.all()).toEqual([1, 2, 3])
  })

  it('lazy collection for empty collection has no items', () => {
    const lazy = collect([]).lazy()
    expect(lazy.all()).toEqual([])
  })

  it('lazy collection supports count', () => {
    expect(collect([1, 2, 3]).lazy().count()).toBe(3)
  })

  it('lazy collection supports filter', () => {
    expect(
      collect([1, 2, 3, 4])
        .lazy()
        .filter((v) => v > 2)
        .all()
    ).toEqual([3, 4])
  })

  it('lazy collection supports map', () => {
    expect(
      collect([1, 2, 3])
        .lazy()
        .map((v) => v * 2)
        .all()
    ).toEqual([2, 4, 6])
  })

  it('lazy collection supports take', () => {
    expect(collect([1, 2, 3, 4]).lazy().take(2).all()).toEqual([1, 2])
  })

  it('lazy collection supports skip', () => {
    expect(collect([1, 2, 3, 4]).lazy().skip(2).all()).toEqual([3, 4])
  })

  it('lazy collection supports first', () => {
    expect(collect([5, 6, 7]).lazy().first()).toBe(5)
  })

  it('lazy collection is iterable', () => {
    const results: number[] = []
    for (const item of collect([1, 2, 3]).lazy()) {
      results.push(item)
    }
    expect(results).toEqual([1, 2, 3])
  })

  it('can convert back to Collection', () => {
    const c = collect([1, 2, 3]).lazy().collect()
    expect(c).toBeInstanceOf(Collection)
    expect(c.all()).toEqual([1, 2, 3])
  })
})
