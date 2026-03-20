import { collect } from '../collect'

describe('multiply', () => {
  it('repeats the collection items N times', () => {
    expect(collect([1, 2]).multiply(3).all()).toEqual([1, 2, 1, 2, 1, 2])
  })

  it('returns empty collection when count is 0', () => {
    expect(collect([1, 2, 3]).multiply(0).all()).toEqual([])
  })

  it('returns same items when count is 1', () => {
    expect(collect([1, 2]).multiply(1).all()).toEqual([1, 2])
  })

  it('returns empty when collection is empty', () => {
    expect(collect([]).multiply(5).all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b']).multiply(2).all()).toEqual(['a', 'b', 'a', 'b'])
  })

  it('works with objects', () => {
    const item = { id: 1 }
    const result = collect([item]).multiply(3).all()
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ id: 1 })
  })

  it('multiplies single item', () => {
    expect(collect([42]).multiply(4).all()).toEqual([42, 42, 42, 42])
  })
})
