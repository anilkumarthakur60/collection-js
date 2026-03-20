import { collect, Collection } from '../collect'

describe('map', () => {
  it('transforms each item', () => {
    expect(
      collect([1, 2, 3])
        .map((v) => v * 2)
        .all()
    ).toEqual([2, 4, 6])
  })

  it('provides index to callback', () => {
    expect(
      collect(['a', 'b', 'c'])
        .map((v, i) => `${i}:${v}`)
        .all()
    ).toEqual(['0:a', '1:b', '2:c'])
  })

  it('returns empty collection for empty input', () => {
    expect(
      collect([])
        .map((v: number) => v)
        .all()
    ).toEqual([])
  })

  it('returns Collection instance', () => {
    expect(collect([1]).map((v) => v)).toBeInstanceOf(Collection)
  })

  it('can change the type', () => {
    expect(
      collect([1, 2, 3])
        .map((v) => String(v))
        .all()
    ).toEqual(['1', '2', '3'])
  })
})

describe('mapInto', () => {
  it('maps each item into a class instance', () => {
    class Wrapper {
      value: number
      constructor(v: number) {
        this.value = v
      }
    }
    const result = collect([1, 2, 3]).mapInto(Wrapper)
    expect(result.all()[0]).toBeInstanceOf(Wrapper)
    expect(result.all()[0].value).toBe(1)
  })

  it('returns Collection instance', () => {
    class Foo {
      constructor(_v: number) {}
    }
    expect(collect([1]).mapInto(Foo)).toBeInstanceOf(Collection)
  })
})

describe('mapSpread', () => {
  it('spreads inner arrays as arguments to callback', () => {
    const result = collect([
      [1, 2],
      [3, 4]
    ]).mapSpread((a: number, b: number) => a + b)
    expect(result.all()).toEqual([3, 7])
  })

  it('returns empty collection for empty input', () => {
    expect(
      collect([])
        .mapSpread(() => 0)
        .all()
    ).toEqual([])
  })
})

describe('mapToGroups', () => {
  it('groups items by key-value pairs from callback', () => {
    const result = collect([1, 2, 3, 4]).mapToGroups((v) => [v % 2 === 0 ? 'even' : 'odd', v])
    expect(result['even']).toEqual([2, 4])
    expect(result['odd']).toEqual([1, 3])
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).mapToGroups((v: number) => ['key', v])).toEqual({})
  })
})

describe('mapWithKeys', () => {
  it('returns an object keyed by callback results', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    const result = collect(items).mapWithKeys((item) => [String(item.id), item.name])
    expect(result).toEqual({ '1': 'Alice', '2': 'Bob' })
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).mapWithKeys((_v: number) => ['k', 'v'])).toEqual({})
  })
})
