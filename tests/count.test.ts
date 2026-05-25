import { collect } from '../src'

describe('count', () => {
  it('returns the number of items', () => {
    expect(collect([1, 2, 3]).count()).toBe(3)
  })

  it('returns 0 for empty collection', () => {
    expect(collect([]).count()).toBe(0)
  })

  it('returns 1 for single item', () => {
    expect(collect([42]).count()).toBe(1)
  })

  it('counts string items', () => {
    expect(collect(['a', 'b', 'c', 'd']).count()).toBe(4)
  })

  it('counts object items', () => {
    expect(collect([{ id: 1 }, { id: 2 }]).count()).toBe(2)
  })
})

describe('countBy', () => {
  it('counts occurrences of each value', () => {
    expect(collect([1, 2, 2, 3, 3, 3]).countBy()).toEqual({ '1': 1, '2': 2, '3': 3 })
  })

  it('counts with string values', () => {
    expect(collect(['apple', 'banana', 'apple']).countBy()).toEqual({ apple: 2, banana: 1 })
  })

  it('counts by iteratee function', () => {
    const result = collect([1, 2, 3, 4, 5]).countBy((v) => (v % 2 === 0 ? 'even' : 'odd'))
    expect(result).toEqual({ even: 2, odd: 3 })
  })

  it('counts by key extractor', () => {
    const items = [{ type: 'A' }, { type: 'B' }, { type: 'A' }]
    const result = collect(items).countBy((item) => item.type)
    expect(result).toEqual({ A: 2, B: 1 })
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).countBy()).toEqual({})
  })

  it('counts single item', () => {
    expect(collect([5]).countBy()).toEqual({ '5': 1 })
  })
})
