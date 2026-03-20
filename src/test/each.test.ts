import { collect } from '../collect'

describe('each', () => {
  it('iterates over each item', () => {
    const result: number[] = []
    collect([1, 2, 3]).each((item) => {
      result.push(item)
    })
    expect(result).toEqual([1, 2, 3])
  })

  it('provides index to callback', () => {
    const indices: number[] = []
    collect(['a', 'b', 'c']).each((_item, index) => {
      indices.push(index)
    })
    expect(indices).toEqual([0, 1, 2])
  })

  it('stops iteration when callback returns false', () => {
    const result: number[] = []
    collect([1, 2, 3, 4, 5]).each((item) => {
      result.push(item)
      if (item === 3) return false
    })
    expect(result).toEqual([1, 2, 3])
  })

  it('returns the collection (chainable)', () => {
    const c = collect([1, 2, 3])
    const returned = c.each(() => {})
    expect(returned).toBe(c)
  })

  it('handles empty collection', () => {
    const result: number[] = []
    collect([]).each((item: number) => {
      result.push(item)
    })
    expect(result).toEqual([])
  })
})

describe('eachSpread', () => {
  it('spreads inner arrays as arguments', () => {
    const result: number[] = []
    collect([
      [1, 2],
      [3, 4]
    ]).eachSpread((a: number, b: number) => {
      result.push(a + b)
    })
    expect(result).toEqual([3, 7])
  })

  it('stops when callback returns false', () => {
    const result: number[] = []
    collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ]).eachSpread((a: number) => {
      result.push(a)
      if (a === 3) return false
    })
    expect(result).toEqual([1, 3])
  })

  it('handles empty collection', () => {
    const result: number[] = []
    collect([]).eachSpread((...args: number[]) => {
      result.push(...args)
    })
    expect(result).toEqual([])
  })

  it('returns the collection (chainable)', () => {
    const c = collect([[1, 2]])
    const returned = c.eachSpread(() => {})
    expect(returned).toBe(c)
  })
})
