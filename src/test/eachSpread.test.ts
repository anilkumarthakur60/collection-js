import { collect } from '../collect'

describe('Collection eachSpread method', () => {
  it('should iterate over each nested item and pass them to the callback', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result: number[] = []
    collection.eachSpread((...args: number[]) => {
      const [a, b] = args
      result.push(a + b)
    })
    expect(result).toEqual([3, 7, 11])
  })

  it('should stop iterating when callback returns false', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result: number[] = []
    collection.eachSpread((a: number, b: number) => {
      result.push(a + b)
      return a + b !== 7 // stop when sum equals 7
    })
    expect(result).toEqual([3, 7])
  })

  it('should handle non-array items by passing them as single arguments', () => {
    const collection = collect([1, [2, 3], 4])
    const result: (number | number[])[] = []
    collection.eachSpread((...args: (number | number[])[]) => {
      result.push(args as unknown as number[])
    })
    expect(result).toEqual([[1], [2, 3], [4]])
  })

  it('should work with an empty collection', () => {
    const collection = collect([])
    const result: number[] = []
    collection.eachSpread((...args: unknown[]) => {
      // For an empty collection, this callback won't be invoked.
      // Using unknown[] here is safer than any[] and satisfies ESLint rules.
      result.push(args.length)
    })
    expect(result).toEqual([])
  })

  it('should pass the correct values to the callback for nested objects', () => {
    const collection = collect([
      { a: 1, b: 2 },
      { c: 3, d: 4 }
    ])
    const result: object[] = []
    collection.eachSpread((item: object) => {
      result.push(item)
    })
    expect(result).toEqual([
      { a: 1, b: 2 },
      { c: 3, d: 4 }
    ])
  })
  it('should allow method chaining', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result = collection.eachSpread((a: number, b: number) => {
      return a + b
    })
    expect(result).toBe(collection)
  })
})
