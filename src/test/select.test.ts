import { collect } from '../collect'

describe('select', () => {
  it('selects specific keys from objects', () => {
    const items = [{ id: 1, name: 'Alice', age: 30 }]
    const result = collect(items).select(['id', 'name'])
    expect(result.all()).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('selects a single key', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    const result = collect(items).select(['name'])
    expect(result.all()).toEqual([{ name: 'Alice' }, { name: 'Bob' }])
  })

  it('handles selecting non-existent keys returns undefined', () => {
    const items = [{ id: 1 }]
    const result = collect(items).select(['id', 'nonexistent' as 'id'])
    expect(result.all()[0]).toHaveProperty('id', 1)
  })

  it('returns empty collection for empty input', () => {
    expect(
      collect([])
        .select(['id' as never])
        .all()
    ).toEqual([])
  })

  it('works with single key as string (not array)', () => {
    const items = [{ name: 'Alice', age: 30 }]
    const result = collect(items).select('name')
    expect(result.all()).toEqual([{ name: 'Alice' }])
  })

  it('selects all keys', () => {
    const items = [{ a: 1, b: 2 }]
    const result = collect(items).select(['a', 'b'])
    expect(result.all()).toEqual([{ a: 1, b: 2 }])
  })

  it('works with multiple items', () => {
    const items = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 }
    ]
    const result = collect(items).select(['a', 'c'])
    expect(result.all()).toEqual([
      { a: 1, c: 3 },
      { a: 4, c: 6 }
    ])
  })
})
