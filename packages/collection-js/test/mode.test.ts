import { collect } from '../src'

describe('mode', () => {
  it('returns an array containing the most frequent value(s)', () => {
    // mode() always returns an array (matches Laravel which returns array even for one mode)
    expect(collect([1, 2, 2, 3]).mode()).toEqual([2])
  })

  it('returns multiple modes when tied', () => {
    const result = collect([1, 1, 2, 2, 3]).mode()!
    expect(result).toEqual(expect.arrayContaining([1, 2]))
    expect(result.length).toBe(2)
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).mode()).toBeUndefined()
  })

  it('returns single-element array for single-item collection', () => {
    expect(collect([42]).mode()).toEqual([42])
  })

  it('works with a key extractor on objects', () => {
    const items = [{ foo: 10 }, { foo: 10 }, { foo: 20 }, { foo: 40 }]
    expect(collect(items).mode('foo')).toEqual([10])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'b', 'c']).mode()).toEqual(['b'])
  })

  it('returns the value when all items are equal', () => {
    expect(collect([5, 5, 5]).mode()).toEqual([5])
  })
})
