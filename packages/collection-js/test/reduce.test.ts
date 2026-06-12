import { collect } from '../src'

describe('reduce', () => {
  it('reduces collection to a single value', () => {
    expect(collect([1, 2, 3, 4]).reduce((acc, v) => acc + v, 0)).toBe(10)
  })

  it('works with string accumulator', () => {
    expect(collect(['a', 'b', 'c']).reduce((acc, v) => acc + v, '')).toBe('abc')
  })

  it('sums with explicit initial value of 0', () => {
    const result = collect([1, 2, 3]).reduce((acc, v) => acc + v, 0)
    expect(result).toBe(6)
  })

  it('returns initial value for empty collection', () => {
    expect(collect([]).reduce((acc, v: number) => acc + v, 0)).toBe(0)
  })

  it('works with multiplication', () => {
    expect(collect([1, 2, 3, 4]).reduce((acc, v) => acc * v, 1)).toBe(24)
  })

  it('provides index to callback', () => {
    const indices: number[] = []
    collect([10, 20, 30]).reduce((acc, _v, i) => {
      if (i !== undefined) indices.push(i)
      return acc
    }, 0)
    expect(indices).toEqual([0, 1, 2])
  })
})

describe('reduce without an initial value (audit: seed-from-first branch untested)', () => {
  it('seeds the accumulator from the first element', () => {
    expect(collect([1, 2, 3, 4]).reduce((acc, v) => acc + v)).toBe(10)
    expect(collect(['a', 'b']).reduce((acc, v) => acc + v)).toBe('ab')
  })

  it('a single element is returned untouched without invoking the callback', () => {
    const fn = vi.fn((acc: number, v: number) => acc + v)
    expect(collect([7]).reduce(fn)).toBe(7)
    expect(fn).not.toHaveBeenCalled()
  })

  it('starts the index at 1 when seeding from the first element', () => {
    const indices: number[] = []
    collect([10, 20, 30]).reduce((acc, v, i) => {
      indices.push(i)
      return acc + v
    })
    expect(indices).toEqual([1, 2])
  })

  it('throws a TypeError on an empty collection', () => {
    expect(() => collect<number>([]).reduce((acc, v) => acc + v)).toThrow(TypeError)
    expect(() => collect<number>([]).reduce((acc, v) => acc + v)).toThrow(
      'Reduce of empty collection with no initial value'
    )
  })
})

describe('reduceSpread', () => {
  it('reduces with multiple accumulator values', () => {
    const result = collect([1, 2, 3]).reduceSpread(
      (sum, product, item) => [
        (sum as number) + (item as number),
        (product as number) * (item as number)
      ],
      0,
      1
    )
    expect(result).toEqual([6, 6])
  })

  it('works with initial values', () => {
    const result = collect([1, 2]).reduceSpread(
      (a, b, item) => [(a as number) + (item as number), (b as number) + (item as number)],
      10,
      20
    )
    expect(result).toEqual([13, 23])
  })

  it('returns initial values for empty collection', () => {
    const result = collect([]).reduceSpread((a, b) => [a, b], 5, 10)
    expect(result).toEqual([5, 10])
  })
})
