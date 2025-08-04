import { collect } from '../collect'

describe('merge', () => {
  it('should merge two flat arrays of primitives', () => {
    const collection = collect([1, 2, 3])
    const merged = collection.merge([4, 5, 6])
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should merge multiple arrays of primitives', () => {
    const collection = collect([1, 2])
    const merged = collection.merge([3, 4], [5, 6])
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle merging with an empty array', () => {
    const collection = collect([1, 2, 3])
    const merged = collection.merge([])
    expect(merged.toArray()).toEqual([1, 2, 3])
  })

  it('should merge an array of objects', () => {
    const collection = collect([{ a: 1 }, { b: 2 }])
    const merged = collection.merge([{ a: 3 }, { b: 4 }])
    expect(merged.toArray()).toEqual([{ a: 1 }, { b: 2 }, { a: 3 }, { b: 4 }])
  })

  it('should merge a collection with another collection', () => {
    const collection1 = collect([1, 2, 3])
    const collection2 = collect([4, 5, 6])
    const merged = collection1.merge(collection2)
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle merging with nested arrays', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const merged = collection.merge([
      [5, 6],
      [7, 8]
    ])
    expect(merged.toArray()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ])
  })

  it('should handle merging collections of mixed types', () => {
    const collection = collect([1, 'two', { three: 3 }])
    const merged = collection.merge(['four', 5, { three: 6 }])
    expect(merged.toArray()).toEqual([1, 'two', { three: 3 }, 'four', 5, { three: 6 }])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const merged = collection.merge([1, 2, 3])
    expect(merged.toArray()).toEqual([1, 2, 3])
  })

  it('should merge multiple collections and arrays together', () => {
    const collection1 = collect([1, 2])
    const collection2 = collect([3, 4])
    const merged = collection1.merge(collection2, [5, 6], [7, 8])
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3])
    const merged = collection.merge([4, 5, 6])
    expect(collection.toArray()).toEqual([1, 2, 3]) // original stays the same
    expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6]) // merged result
  })

  it('should handle merging collections with different types of values', () => {
    const collection1 = collect([{ id: 1 }, 42, 'string'])
    const collection2 = collect([{ id: 2 }, 43, 'another string'])
    const merged = collection1.merge(collection2)
    expect(merged.toArray()).toEqual([{ id: 1 }, 42, 'string', { id: 2 }, 43, 'another string'])
  })
})
