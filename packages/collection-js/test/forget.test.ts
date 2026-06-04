import { collect } from '../src'

describe('forget', () => {
  it('removes item at given numeric index', () => {
    expect(collect([1, 2, 3]).forget(1).all()).toEqual([1, 3])
  })

  it('removes first item (index 0)', () => {
    expect(collect([1, 2, 3]).forget(0).all()).toEqual([2, 3])
  })

  it('removes last item', () => {
    expect(collect([1, 2, 3]).forget(2).all()).toEqual([1, 2])
  })

  it('returns same collection when index out of bounds', () => {
    expect(collect([1, 2, 3]).forget(10).all()).toEqual([1, 2, 3])
  })

  it('removes a key from all objects when given a string key', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    const result = collect(items).forget('name')
    expect(result.all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('does nothing with string key when key not present', () => {
    const items = [{ id: 1 }]
    const result = collect(items).forget('nonexistent')
    expect(result.all()).toEqual([{ id: 1 }])
  })

  it('removes multiple numeric indices', () => {
    const result = collect([1, 2, 3, 4, 5]).forget([1, 3])
    expect(result.all()).toEqual([1, 3, 5])
  })

  it('removes multiple string keys', () => {
    const items = [{ a: 1, b: 2, c: 3 }]
    const result = collect(items).forget(['a', 'c'])
    expect(result.all()).toEqual([{ b: 2 }])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).forget(0).all()).toEqual([])
  })
})
