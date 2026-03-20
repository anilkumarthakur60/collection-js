import { collect } from '../collect'

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
