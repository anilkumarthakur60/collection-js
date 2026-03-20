import { collect } from '../collect'

describe('reverse', () => {
  it('reverses the order of items', () => {
    expect(collect([1, 2, 3]).reverse().all()).toEqual([3, 2, 1])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).reverse().all()).toEqual([])
  })

  it('returns same single item for single-item collection', () => {
    expect(collect([42]).reverse().all()).toEqual([42])
  })

  it('does not mutate original collection', () => {
    const c = collect([1, 2, 3])
    c.reverse()
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).reverse().all()).toEqual(['c', 'b', 'a'])
  })

  it('double reverse returns original order', () => {
    expect(collect([1, 2, 3]).reverse().reverse().all()).toEqual([1, 2, 3])
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).reverse().all()).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }])
  })
})
