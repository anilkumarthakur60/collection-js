import { collect, Collection } from '../src'

describe('pluck', () => {
  it('extracts values by key', () => {
    const items = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
    const result = collect(items).pluck('name')
    expect((result as Collection<string>).all()).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('extracts numeric values by key', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = collect(items).pluck('id')
    expect((result as Collection<number>).all()).toEqual([1, 2, 3])
  })

  it('plucks with keyBy to create keyed record', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    const result = collect(items).pluck('name', 'id')
    expect(result).toEqual({ '1': 'Alice', '2': 'Bob' })
  })

  it('returns empty Collection for empty input', () => {
    const result = collect([]).pluck('id' as never)
    expect((result as Collection<never>).all()).toEqual([])
  })

  it('returns Collection instance without keyBy', () => {
    const result = collect([{ v: 1 }]).pluck('v')
    expect(result).toBeInstanceOf(Collection)
  })

  it('plucks nested values correctly', () => {
    const items = [{ score: 90 }, { score: 80 }]
    const result = collect(items).pluck('score')
    expect((result as Collection<number>).all()).toEqual([90, 80])
  })
})
