import { collect } from '../collect'

describe('keys', () => {
  it('should return keys for an object-based collection', () => {
    const collection = collect([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ])
    const result = collection.keys()
    expect(result).toEqual(['id', 'name'])
  })

  it('should return indices as keys for an array-based collection', () => {
    const collection = collect(['a', 'b', 'c'])
    const result = collection.keys()
    expect(result).toEqual(['0', '1', '2'])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.keys()
    expect(result).toEqual([])
  })

  it('should return keys for a collection of objects with mixed properties', () => {
    const collection = collect([
      { id: 1, name: 'Alice' },
      { id: 2, role: 'admin' }
    ])
    const result = collection.keys()
    expect(result).toEqual(['id', 'name', 'role'])
  })

  it('should return indices for nested arrays', () => {
    const collection = collect([[1, 2], [3, 4], [5]])
    const result = collection.keys()
    expect(result).toEqual(['0', '1', '2'])
  })

  it('should work with mixed-type collections', () => {
    const collection = collect(['a', { key: 'value' }, 42, [1, 2]])
    const result = collection.keys()
    expect(result).toEqual(['0', '1', '2', '3'])
  })

  it('should handle a single object collection gracefully', () => {
    const collection = collect([{ id: 1, name: 'Alice' }])
    const result = collection.keys()
    expect(result).toEqual(['id', 'name'])
  })

  it('should return indices as keys for a collection of primitives', () => {
    const collection = collect([10, 20, 30])
    const result = collection.keys()
    expect(result).toEqual(['0', '1', '2'])
  })

  it('should return keys for nested objects in a collection', () => {
    const collection = collect([{ user: { id: 1, name: 'Alice' }, active: true }])
    const result = collection.keys()
    expect(result).toEqual(['user', 'active'])
  })

  it('should return keys for deeply nested objects', () => {
    const collection = collect([{ user: { details: { name: 'Alice', age: 25 }, active: true } }])
    const result = collection.keys()
    expect(result).toEqual(['user'])
  })
})
