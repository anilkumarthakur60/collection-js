import { collect } from '../src/collect'

describe('crossJoin', () => {
  it('computes cartesian product with one array', () => {
    const result = collect([1, 2]).crossJoin(['a', 'b'])
    expect(result.all()).toEqual([
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [2, 'b']
    ])
  })

  it('computes cartesian product with two arrays', () => {
    const result = collect([1, 2]).crossJoin(['a', 'b'], [true, false])
    expect(result.all()).toEqual([
      [1, 'a', true],
      [1, 'a', false],
      [1, 'b', true],
      [1, 'b', false],
      [2, 'a', true],
      [2, 'a', false],
      [2, 'b', true],
      [2, 'b', false]
    ])
  })

  it('returns empty collection when source is empty', () => {
    expect(collect([]).crossJoin([1, 2]).all()).toEqual([])
  })

  it('returns correct count', () => {
    const result = collect([1, 2, 3]).crossJoin([4, 5])
    expect(result.count()).toBe(6)
  })

  it('works with single item collections', () => {
    const result = collect([1]).crossJoin([2])
    expect(result.all()).toEqual([[1, 2]])
  })

  it('works with strings', () => {
    const result = collect(['a']).crossJoin(['b', 'c'])
    expect(result.all()).toEqual([
      ['a', 'b'],
      ['a', 'c']
    ])
  })
})
