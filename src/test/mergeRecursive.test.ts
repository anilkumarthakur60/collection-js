import { collect } from '../collect'

describe('mergeRecursive', () => {
  it('should merge two flat arrays of primitives', () => {
    const collection = collect([1, 2, 3])
    const merged = collection.mergeRecursive([4, 5, 6])
    expect(merged.all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should merge multiple arrays of primitives', () => {
    const collection = collect([1, 2])
    const merged = collection.mergeRecursive([3, 4], [5, 6])
    expect(merged.all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle merging with an empty array gracefully', () => {
    const collection = collect([1, 2, 3])
    const merged = collection.mergeRecursive([])
    expect(merged.all()).toEqual([1, 2, 3])
  })

  it('should deeply merge arrays of objects', () => {
    const collection = collect([{ a: 1, b: 2 }, { c: 3 }])
    const merged = collection.mergeRecursive([
      { a: 10, d: 4 },
      { c: 5, e: 6 }
    ])
    // Assuming mergeRecursive merges corresponding elements:
    // First element: { a: 1, b: 2 } merged with { a: 10, d: 4 } -> { a: 10, b: 2, d: 4 }
    // Second element: { c: 3 } merged with { c: 5, e: 6 } -> { c: 5, e: 6 }
    expect(merged.toArray()).toEqual([
      { a: 10, b: 2, d: 4 },
      { c: 5, e: 6 }
    ])
  })

  it('should handle nested objects', () => {
    const collection = collect([{ user: { name: 'Alice', age: 25 }, role: 'admin' }])
    const merged = collection.mergeRecursive([
      { user: { age: 26, email: 'alice@example.com' }, active: true }
    ])
    // Deep merge:
    // user: { name: 'Alice', age: 25 } merged with { age: 26, email: 'alice@example.com' }
    // results in { name: 'Alice', age: 26, email: 'alice@example.com' }
    // role: 'admin' remains, active: true added
    expect(merged.toArray()).toEqual([
      {
        user: { name: 'Alice', age: 26, email: 'alice@example.com' },
        role: 'admin',
        active: true
      }
    ])
  })

  it('should concatenate arrays when merging arrays nested within objects', () => {
    const collection = collect([{ tags: ['tag1', 'tag2'], data: { items: [1, 2] } }])
    const merged = collection.mergeRecursive([{ tags: ['tag3'], data: { items: [3, 4] } }])
    // For tags: ['tag1', 'tag2'] merged with ['tag3'] -> ['tag1', 'tag2', 'tag3']
    // For items: [1, 2] merged with [3, 4] -> [1, 2, 3, 4]
    expect(merged.toArray()).toEqual([
      {
        tags: ['tag1', 'tag2', 'tag3'],
        data: { items: [1, 2, 3, 4] }
      }
    ])
  })

  it('should handle merging primitive values and objects by replacing primitives', () => {
    const collection = collect([42])
    const merged = collection.mergeRecursive([{ value: 'new' }])
    // Assuming that merging a primitive with an object results in the object replacing the primitive.
    // If your logic differs, adjust the expected result accordingly.
    expect(merged.toArray()).toEqual([{ value: 'new' }])
  })

  it('should handle non-matching structures in arrays gracefully', () => {
    const collection = collect([{ a: 1 }, 2, { b: 3 }])
    const merged = collection.mergeRecursive([10, { a: 2 }, [100, 200]])
    // Example interpretation:
    // Index 0: { a: 1 } merged with 10 might replace object with 10 or treat differently.
    // Index 1: 2 merged with { a: 2 } might also replace or fail gracefully.
    // Index 2: { b: 3 } merged with [100, 200] might result in some fallback.
    // Adjust the expectation based on your actual `mergeRecursive` implementation.
    // For a generic assumption: If types differ, last one wins:
    expect(merged.toArray()).toEqual([10, { a: 2 }, [100, 200]])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([{ a: 1 }])
    const merged = collection.mergeRecursive([{ a: 2 }])
    expect(collection.toArray()).toEqual([{ a: 1 }]) // original stays the same
    expect(merged.toArray()).toEqual([{ a: 2 }])
  })
})
