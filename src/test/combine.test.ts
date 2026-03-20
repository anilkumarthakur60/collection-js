import { collect } from '../collect'

describe('combine', () => {
  it('combines keys with values as tuples', () => {
    const result = collect(['name', 'age']).combine(['Alice', 30])
    expect(result.all()).toEqual([
      ['name', 'Alice'],
      ['age', 30]
    ])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).combine([]).all()).toEqual([])
  })

  it('handles more keys than values', () => {
    const result = collect(['a', 'b', 'c']).combine([1, 2])
    expect(result.all()).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', undefined]
    ])
  })

  it('works with string keys and string values', () => {
    const result = collect(['first', 'last']).combine(['John', 'Doe'])
    expect(result.all()).toEqual([
      ['first', 'John'],
      ['last', 'Doe']
    ])
  })

  it('works with number keys', () => {
    const result = collect([1, 2, 3]).combine(['a', 'b', 'c'])
    expect(result.all()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c']
    ])
  })

  it('returns correct count', () => {
    expect(collect(['x', 'y']).combine([10, 20]).count()).toBe(2)
  })

  it('works with single pair', () => {
    const result = collect(['key']).combine(['value'])
    expect(result.all()).toEqual([['key', 'value']])
  })
})
