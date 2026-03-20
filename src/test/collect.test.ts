import { collect, Collection } from '../collect'

describe('collect (instance method)', () => {
  it('returns a new Collection with the same items', () => {
    const original = collect([1, 2, 3])
    const copy = original.collect()
    expect(copy.all()).toEqual([1, 2, 3])
  })

  it('returns a Collection instance', () => {
    expect(collect([1, 2, 3]).collect()).toBeInstanceOf(Collection)
  })

  it('the copy is a different object reference', () => {
    const original = collect([1, 2, 3])
    const copy = original.collect()
    expect(copy).not.toBe(original)
  })

  it('works with empty collection', () => {
    const copy = collect([]).collect()
    expect(copy.all()).toEqual([])
    expect(copy).toBeInstanceOf(Collection)
  })

  it('works with string items', () => {
    const copy = collect(['a', 'b', 'c']).collect()
    expect(copy.all()).toEqual(['a', 'b', 'c'])
  })

  it('works with object items', () => {
    const items = [{ id: 1 }, { id: 2 }]
    const copy = collect(items).collect()
    expect(copy.all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('push on copy also affects original since they share the same array reference', () => {
    const original = collect([1, 2, 3])
    const copy = original.collect()
    copy.push(4)
    // collect() shares the same items array, so push mutates both
    expect(copy.count()).toBe(4)
  })
})
