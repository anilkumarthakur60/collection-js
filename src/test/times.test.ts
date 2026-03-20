import { collect, Collection } from '../collect'

describe('Collection.times (static)', () => {
  it('creates a collection by calling callback N times', () => {
    const result = Collection.times(3, (i) => i * 2)
    expect(result.all()).toEqual([2, 4, 6])
  })

  it('index starts from 1', () => {
    const result = Collection.times(3, (i) => i)
    expect(result.all()).toEqual([1, 2, 3])
  })

  it('returns empty for count 0', () => {
    const result = Collection.times(0, (i) => i)
    expect(result.all()).toEqual([])
  })

  it('returns Collection instance', () => {
    expect(Collection.times(3, (i) => i)).toBeInstanceOf(Collection)
  })

  it('works with string callback', () => {
    const result = Collection.times(3, (i) => `item-${i}`)
    expect(result.all()).toEqual(['item-1', 'item-2', 'item-3'])
  })
})

describe('times (instance method)', () => {
  it('repeats the collection items N times', () => {
    expect(collect([1, 2]).times(3).all()).toEqual([1, 2, 1, 2, 1, 2])
  })

  it('returns empty when count is 0', () => {
    expect(collect([1, 2]).times(0).all()).toEqual([])
  })

  it('returns same items when count is 1', () => {
    expect(collect([1, 2]).times(1).all()).toEqual([1, 2])
  })

  it('works with empty collection', () => {
    expect(collect([]).times(5).all()).toEqual([])
  })
})
