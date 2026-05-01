import { collect } from '../src'

describe('last', () => {
  it('returns the last item', () => {
    expect(collect([1, 2, 3]).last()).toBe(3)
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).last()).toBeUndefined()
  })

  it('returns last matching item with predicate', () => {
    expect(collect([1, 2, 3, 4]).last((v) => v % 2 === 0)).toBe(4)
  })

  it('returns undefined when predicate matches nothing', () => {
    expect(collect([1, 2, 3]).last((v) => v > 10)).toBeUndefined()
  })

  it('returns single item for single-item collection', () => {
    expect(collect([42]).last()).toBe(42)
  })

  it('returns last string', () => {
    expect(collect(['a', 'b', 'c']).last()).toBe('c')
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).last()).toEqual({ id: 3 })
  })

  it('predicate receives index', () => {
    expect(collect(['x', 'y', 'z']).last((_v, i) => i < 2)).toBe('y')
  })

})
