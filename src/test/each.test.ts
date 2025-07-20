import { collect } from '../collect'

describe('Collection each method', () => {
  it('should iterate over each item in the collection and pass it to the callback', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result: number[] = []
    collection.each((item) => {
      result.push(item * 2)
    })
    expect(result).toEqual([2, 4, 6, 8, 10])
  })

  it('should work with an empty collection', () => {
    const collection = collect([])
    const result: number[] = []
    collection.each((item) => {
      result.push(item as number)
    })
    expect(result).toEqual([])
  })

  it('should pass the correct index to the callback', () => {
    const collection = collect(['a', 'b', 'c'])
    const indices: number[] = []
    collection.each((_, index) => {
      indices.push(index)
    })
    expect(indices).toEqual([0, 1, 2])
  })

  it('should work with objects in the collection', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const result: number[] = []
    collection.each((item) => {
      result.push(item.id)
    })
    expect(result).toEqual([1, 2, 3])
  })

  it('should return the collection itself to allow for method chaining', () => {
    const collection = collect([1, 2, 3])
    const result = collection.each((item) => item)
    expect(result).toBe(collection)
  })

  it('should work with nested collections', () => {
    const collection = collect([collect([1, 2]), collect([3, 4]), collect([5])])
    const result: number[][] = []
    collection.each((item) => {
      result.push(item.toArray())
    })
    expect(result).toEqual([[1, 2], [3, 4], [5]])
  })

  it('should work with different data types in the collection', () => {
    const collection = collect([1, 'apple', true, { id: 2 }, null])
    const result: string[] = []
    collection.each((item) => {
      result.push(typeof item)
    })
    expect(result).toEqual(['number', 'string', 'boolean', 'object', 'object'])
  })

  it('should modify the original items when modified within the callback', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    collection.each((item) => {
      item.id *= 2
    })
    expect(collection.toArray()).toEqual([{ id: 2 }, { id: 4 }, { id: 6 }])
  })

  it('should perform well with a large collection', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i)
    const collection = collect(largeArray)
    let sum = 0
    collection.each((item) => {
      sum += item
    })
    expect(sum).toBe((9999 * 10000) / 2) // Sum of first 10000 natural numbers
  })
})
