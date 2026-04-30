import { collect, Collection } from '../src'

describe('zip', () => {
  it('zips two collections together', () => {
    const result = collect([1, 2, 3]).zip(['a', 'b', 'c'])
    expect(result.all()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c']
    ])
  })

  it('fills undefined for mismatched lengths', () => {
    const result = collect([1, 2, 3]).zip(['a', 'b'])
    expect(result.all()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, undefined]
    ])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).zip([1, 2]).all()).toEqual([])
  })

  it('works with objects', () => {
    const result = collect([{ id: 1 }]).zip([{ name: 'Alice' }])
    expect(result.all()).toEqual([[{ id: 1 }, { name: 'Alice' }]])
  })

  it('returns Collection instance', () => {
    expect(collect([1]).zip([2])).toBeInstanceOf(Collection)
  })
})

describe('wrap', () => {
  it('wraps all items in a single outer array', () => {
    const result = collect([1, 2, 3]).wrap()
    expect(result.all()).toEqual([[1, 2, 3]])
  })

  it('wraps empty collection', () => {
    const result = collect([]).wrap()
    expect(result.all()).toEqual([[]])
  })

  it('returns Collection instance', () => {
    expect(collect([1, 2]).wrap()).toBeInstanceOf(Collection)
  })

  it('count is always 1', () => {
    expect(collect([1, 2, 3]).wrap().count()).toBe(1)
  })
})

describe('unwrap', () => {
  it('returns single item when collection has one item', () => {
    expect(collect([42]).unwrap()).toBe(42)
  })

  it('returns array when collection has multiple items', () => {
    expect(collect([1, 2, 3]).unwrap()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty collection', () => {
    expect(collect([]).unwrap()).toEqual([])
  })

  it('returns single string item directly', () => {
    expect(collect(['hello']).unwrap()).toBe('hello')
  })
})
