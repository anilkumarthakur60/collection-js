import { collect } from '../collect'

describe('Collection eachSpread method', () => {
  it('should iterate over each nested item and pass them to the callback', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result: number[] = []
    collection.eachSpread((...args) => {
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
    collection.eachSpread((a, b) => {
      result.push(a + b)
      return a + b !== 7 // stop when sum equals 7
    })
    expect(result).toEqual([3, 7])
  })

  it('should handle non-array items by passing them as single arguments', () => {
    const collection = collect([1, [2, 3], 4])
    const result: any[] = []
    collection.eachSpread((...args) => {
      result.push(args)
    })
    expect(result).toEqual([[1], [2, 3], [4]])
  })

  it('should work with an empty collection', () => {
    const collection = collect([])
    const result: number[] = []
    collection.eachSpread((...args) => {
      result.push(args.length)
    })
    expect(result).toEqual([])
  })

  it('should pass the correct values to the callback for nested objects', () => {
    const collection = collect([
      { a: 1, b: 2 },
      { c: 3, d: 4 }
    ])
    const result: any[] = []
    collection.eachSpread((item) => {
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
    const result = collection.eachSpread((a, b) => a + b)
    expect(result).toBe(collection)
  })
})
