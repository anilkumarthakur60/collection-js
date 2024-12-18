import { collect } from '../collect'

describe('Collection.pipe', () => {
  it('should return the result of the closure executed with the collection', () => {
    const collection = collect([1, 2, 3])

    const result = collection.pipe((c) => c.sum((value) => value))

    expect(result).toBe(6)
  })

  it('should allow transforming the collection into another type', () => {
    const collection = collect([1, 2, 3])

    const result = collection.pipe((c) => c.toArray().join(','))

    expect(result).toBe('1,2,3')
  })

  it('should handle empty collections correctly', () => {
    const collection = collect<number>([])

    const result = collection.pipe((c) => c.sum((value) => value))

    expect(result).toBe(0)
  })

  it('should work with complex operations', () => {
    const collection = collect([1, 2, 3, 4])

    const result = collection.pipe((c) => {
      return c.filter((value) => value % 2 === 0).sum((value) => value)
    })

    expect(result).toBe(6) // 2 + 4
  })
})
