import { collect } from '../collect'

describe('map', () => {
  it('should map a collection of numbers by doubling their values', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.map((item: number) => item * 2)
    expect(result.toArray()).toEqual([2, 4, 6, 8, 10])
  })

  it('should map a collection of strings to their uppercase equivalents', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    const result = collection.map((item: string) => item.toUpperCase())
    expect(result.toArray()).toEqual(['APPLE', 'BANANA', 'CHERRY'])
  })

  it('should map a collection of objects by extracting a specific property', () => {
    const collection = collect([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ])
    const result = collection.map((item: { id: number; name: string }) => item.name)
    expect(result.toArray()).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('should map a collection of objects to new objects with modified properties', () => {
    const collection = collect([
      { id: 1, value: 10 },
      { id: 2, value: 20 }
    ])
    const result = collection.map((item: { id: number; value: number }) => ({
      id: item.id,
      newValue: item.value * 2
    }))
    expect(result.toArray()).toEqual([
      { id: 1, newValue: 20 },
      { id: 2, newValue: 40 }
    ])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.map((item: unknown) => item)
    expect(result.toArray()).toEqual([])
  })

  it('should map with an index as the second argument in the callback', () => {
    const collection = collect(['a', 'b', 'c'])
    const result = collection.map((item: string, index: number) => `${index}: ${item}`)
    expect(result.toArray()).toEqual(['0: a', '1: b', '2: c'])
  })

  it('should handle collections with mixed types', () => {
    const collection = collect([1, 'two', { key: 'three' }])
    const result = collection.map((item: number | string | object) => {
      if (typeof item === 'number') return item * 2
      if (typeof item === 'string') return item.toUpperCase()
      if (typeof item === 'object') return { ...item, addedKey: 'value' }
    })
    expect(result.toArray()).toEqual([2, 'TWO', { key: 'three', addedKey: 'value' }])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3])
    const result = collection.map((item: number) => item * 2)
    expect(collection.toArray()).toEqual([1, 2, 3]) // Original remains unchanged
    expect(result.toArray()).toEqual([2, 4, 6]) // Transformed collection
  })

  it('should return the same type for mapping arrays of arrays', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const result = collection.map((item: number[]) => item.map((num) => num * 2))
    expect(result.toArray()).toEqual([
      [2, 4],
      [6, 8]
    ])
  })

  it('should handle mapping to a constant value', () => {
    const collection = collect([1, 2, 3])
    const result = collection.map(() => 'constant')
    expect(result.toArray()).toEqual(['constant', 'constant', 'constant'])
  })

  it('should map nested objects in the collection', () => {
    const collection = collect([
      { user: { name: 'Alice', age: 25 } },
      { user: { name: 'Bob', age: 30 } }
    ])
    const result = collection.map((item: { user: { name: string; age: number } }) => ({
      ...item,
      user: { ...item.user, age: item.user.age + 1 }
    }))
    expect(result.toArray()).toEqual([
      { user: { name: 'Alice', age: 26 } },
      { user: { name: 'Bob', age: 31 } }
    ])
  })
})
