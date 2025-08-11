import { collect } from '../collect'

describe('duplicates', () => {
  it('returns items that appear more than once', () => {
    expect(collect([1, 2, 2, 3, 3, 3]).duplicates().all()).toEqual([2, 3])
  })

  it('returns empty collection when no duplicates', () => {
    expect(collect([1, 2, 3]).duplicates().all()).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).duplicates().all()).toEqual([])
  })

  it('works with a key on objects', () => {
    const items = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Alice', age: 35 }
    ]
    const result = collect(items).duplicates('name' as keyof (typeof items)[0])
    expect(result.count()).toBe(1)
    expect(result.all()[0].name).toBe('Alice')
  })

  it('returns first occurrence only when duplicated', () => {
    const result = collect([1, 2, 2]).duplicates()
    expect(result.all()).toEqual([2])
  })
})

describe('duplicatesStrict', () => {
  it('returns all duplicate occurrences strictly', () => {
    const result = collect([1, 2, 2, 3]).duplicatesStrict()
    expect(result.all()).toEqual([2, 2])
  })

  it('returns empty for no duplicates', () => {
    expect(collect([1, 2, 3]).duplicatesStrict().all()).toEqual([])
  })

  it('works with a key on objects', () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Alice' }]
    const result = collect(items).duplicatesStrict('name' as keyof (typeof items)[0])
    expect(result.count()).toBe(2)
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).duplicatesStrict().all()).toEqual([])
  })
})
