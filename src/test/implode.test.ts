import { collect } from '../collect'

describe('implode', () => {
  it('joins items with a glue string', () => {
    expect(collect([1, 2, 3]).implode(', ')).toBe('1, 2, 3')
  })

  it('joins with key from objects', () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
    expect(collect(items).implode(', ', 'name')).toBe('Alice, Bob, Charlie')
  })

  it('returns empty string for empty collection', () => {
    expect(collect([]).implode(', ')).toBe('')
  })

  it('joins single item without glue', () => {
    expect(collect([42]).implode(', ')).toBe('42')
  })

  it('joins strings with dash', () => {
    expect(collect(['a', 'b', 'c']).implode('-')).toBe('a-b-c')
  })

  it('uses callback as glue transformer', () => {
    const result = collect([1, 2, 3]).implode((item) => `(${item})`)
    expect(result).toBe('(1)(2)(3)')
  })
})

describe('join', () => {
  it('joins items with separator', () => {
    expect(collect(['a', 'b', 'c']).join(', ')).toBe('a, b, c')
  })

  it('joins with final separator', () => {
    expect(collect(['a', 'b', 'c']).join(', ', ', and ')).toBe('a, b, and c')
  })

  it('returns empty string for empty collection', () => {
    expect(collect([]).join(', ')).toBe('')
  })

  it('returns single item without separator for single-item collection', () => {
    expect(collect(['hello']).join(', ', ' and ')).toBe('hello')
  })

  it('joins two items with final separator', () => {
    expect(collect(['a', 'b']).join(', ', ' and ')).toBe('a and b')
  })

  it('joins numbers', () => {
    expect(collect([1, 2, 3]).join(' + ')).toBe('1 + 2 + 3')
  })
})
