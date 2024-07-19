import { collect } from '../collect'

describe('flip', () => {
  it('should flip an array of strings', () => {
    const collection = collect(['a', 'b', 'c'])
    expect(collection.flip().all()).toEqual([{ a: 0, b: 1, c: 2 }])
  })

  it('should flip an array of numbers', () => {
    const collection = collect([1, 2, 3])
    expect(collection.flip().all()).toEqual([{ '1': 0, '2': 1, '3': 2 }])
  })

  it('should flip an array with mixed strings and numbers', () => {
    const collection = collect(['a', 2, 'c', 4])
    expect(collection.flip().all()).toEqual([{ a: 0, '2': 1, c: 2, '4': 3 }])
  })

  it('should handle an empty array', () => {
    const collection = collect([])
    expect(collection.flip().all()).toEqual([{}])
  })

  it('should throw an error for an array with invalid types', () => {
    const collection = collect(['a', { key: 'value' }, 'c'])
    expect(() => collection.flip()).toThrow(
      'Collection items must be of type string or number to flip.'
    )
  })

  it('should handle an array with duplicate values by using the last occurrence', () => {
    const collection = collect(['a', 'b', 'a'])
    expect(collection.flip().all()).toEqual([{ a: 2, b: 1 }])
  })

  it('should handle a large array of numbers', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1)
    const collection = collect(largeArray)
    const expected = largeArray.reduce(
      (acc, num, index) => {
        acc[num.toString()] = index
        return acc
      },
      {} as Record<string, number>
    )
    expect(collection.flip().all()).toEqual([expected])
  })

  it('should handle a large array of strings', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => `item${i + 1}`)
    const collection = collect(largeArray)
    const expected = largeArray.reduce(
      (acc, str, index) => {
        acc[str] = index
        return acc
      },
      {} as Record<string, number>
    )
    expect(collection.flip().all()).toEqual([expected])
  })
})
