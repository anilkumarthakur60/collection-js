import { collect } from '../src'

describe('except', () => {
  it('removes specified keys from each object', () => {
    const items = [{ id: 1, name: 'Alice', age: 30 }]
    const result = collect(items).except(['age'])
    expect(result.all()).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('removes multiple keys', () => {
    const items = [{ a: 1, b: 2, c: 3 }]
    const result = collect(items).except(['a', 'c'])
    expect(result.all()).toEqual([{ b: 2 }])
  })

  it('returns unchanged objects when keys not present', () => {
    const items = [{ id: 1, name: 'Alice' }]
    const result = collect(items).except(['nonexistent' as keyof { id: number; name: string }])
    expect(result.all()).toEqual([{ id: 1, name: 'Alice' }])
  })

  it('works with multiple items', () => {
    const items = [
      { id: 1, secret: 'x' },
      { id: 2, secret: 'y' }
    ]
    const result = collect(items).except(['secret'])
    expect(result.all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('returns empty collection for empty input', () => {
    expect(
      collect([])
        .except(['a' as never])
        .all()
    ).toEqual([])
  })
})

describe('only', () => {
  it('returns only specified keys from each object', () => {
    const items = [{ id: 1, name: 'Alice', age: 30 }]
    const result = collect(items).only(['name'])
    expect(result.all()).toEqual([{ name: 'Alice' }])
  })

  it('returns multiple specified keys', () => {
    const items = [{ a: 1, b: 2, c: 3 }]
    const result = collect(items).only(['a', 'c'])
    expect(result.all()).toEqual([{ a: 1, c: 3 }])
  })

  it('returns undefined for keys not present in object', () => {
    const items = [{ id: 1 }]
    const result = collect(items).only(['id', 'name'])
    expect(result.all()[0]).toEqual({ id: 1, name: undefined })
  })

  it('works with multiple items', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    const result = collect(items).only(['id'])
    expect(result.all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).only(['a']).all()).toEqual([])
  })
})
