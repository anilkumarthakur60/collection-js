import { collect } from '../src/collect'

describe('sort', () => {
  it('sorts numbers in ascending order', () => {
    expect(collect([3, 1, 4, 1, 5, 9]).sort().all()).toEqual([1, 1, 3, 4, 5, 9])
  })

  it('sorts strings', () => {
    expect(collect(['banana', 'apple', 'cherry']).sort().all()).toEqual([
      'apple',
      'banana',
      'cherry'
    ])
  })

  it('sorts with custom callback', () => {
    expect(
      collect([3, 1, 2])
        .sort((a, b) => b - a)
        .all()
    ).toEqual([3, 2, 1])
  })

  it('does not mutate original', () => {
    const c = collect([3, 1, 2])
    c.sort()
    expect(c.all()).toEqual([3, 1, 2])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).sort().all()).toEqual([])
  })
})

describe('sortBy', () => {
  it('sorts by object key', () => {
    const items = [{ age: 30 }, { age: 20 }, { age: 25 }]
    expect(collect(items).sortBy('age').all()).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }])
  })

  it('sorts by callback', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
    expect(
      collect(items)
        .sortBy((v) => v.name)
        .all()
    ).toEqual([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }])
  })
})

describe('sortByDesc', () => {
  it('sorts by key in descending order', () => {
    const items = [{ age: 20 }, { age: 30 }, { age: 25 }]
    expect(collect(items).sortByDesc('age').all()).toEqual([{ age: 30 }, { age: 25 }, { age: 20 }])
  })

  it('sorts by callback descending', () => {
    const items = [{ v: 1 }, { v: 3 }, { v: 2 }]
    expect(
      collect(items)
        .sortByDesc((x) => x.v)
        .all()
    ).toEqual([{ v: 3 }, { v: 2 }, { v: 1 }])
  })
})

describe('sortDesc', () => {
  it('sorts numbers in descending order', () => {
    expect(collect([1, 3, 2]).sortDesc().all()).toEqual([3, 2, 1])
  })

  it('sorts strings descending', () => {
    expect(collect(['apple', 'cherry', 'banana']).sortDesc().all()).toEqual([
      'cherry',
      'banana',
      'apple'
    ])
  })
})

describe('sortKeys', () => {
  it('sorts object keys alphabetically', () => {
    const items = [{ c: 3, a: 1, b: 2 }]
    const result = collect(items).sortKeys().all()
    expect(Object.keys(result[0])).toEqual(['a', 'b', 'c'])
  })
})

describe('sortKeysDesc', () => {
  it('sorts object keys in descending order', () => {
    const items = [{ a: 1, c: 3, b: 2 }]
    const result = collect(items).sortKeysDesc().all()
    expect(Object.keys(result[0])).toEqual(['c', 'b', 'a'])
  })
})

describe('sortKeysUsing', () => {
  it('sorts keys with custom comparator', () => {
    const items = [{ b: 2, a: 1 }]
    const result = collect(items)
      .sortKeysUsing((a, b) => a.localeCompare(b))
      .all()
    expect(Object.keys(result[0])).toEqual(['a', 'b'])
  })
})
