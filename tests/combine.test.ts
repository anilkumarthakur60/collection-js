import { collect } from '../src'

describe('combine', () => {
  it('combines keys with values into a record (Laravel parity)', () => {
    expect(collect(['name', 'age']).combine(['Alice', 30])).toEqual({ name: 'Alice', age: 30 })
  })

  it('returns empty record for empty input', () => {
    expect(collect([]).combine([])).toEqual({})
  })

  it('drops extra keys when there are more keys than values', () => {
    expect(collect(['a', 'b', 'c']).combine([1, 2])).toEqual({ a: 1, b: 2 })
  })

  it('works with string keys and values', () => {
    expect(collect(['first', 'last']).combine(['John', 'Doe'])).toEqual({
      first: 'John',
      last: 'Doe',
    })
  })

  it('works with numeric keys (coerced to string in record)', () => {
    expect(collect([1, 2, 3]).combine(['a', 'b', 'c'])).toEqual({ '1': 'a', '2': 'b', '3': 'c' })
  })

  it('works with single pair', () => {
    expect(collect(['key']).combine(['value'])).toEqual({ key: 'value' })
  })
})
