import { collect } from '../collect'

describe('make', () => {
  it('should apply a transformation to each item in the collection', () => {
    const collection = collect([1, 2, 3, 4])
    const result = collection.make((item: number) => item * 2)
    expect(result.toArray()).toEqual([2, 4, 6, 8])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.make((item: number) => item * 2)
    expect(result.toArray()).toEqual([])
  })

  it('should allow transforming objects within a collection', () => {
    const collection = collect([{ name: 'Alice' }, { name: 'Bob' }])
    const result = collection.make((item: { name: string }) => ({
      ...item,
      name: item.name.toUpperCase()
    }))
    expect(result.toArray()).toEqual([{ name: 'ALICE' }, { name: 'BOB' }])
  })

  it('should allow transforming arrays within a collection', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const result = collection.make((item: number[]) => item.map((n) => n * 2))
    expect(result.toArray()).toEqual([
      [2, 4],
      [6, 8]
    ])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3])
    const result = collection.make((item: number) => item * 2)
    expect(collection.toArray()).toEqual([1, 2, 3]) // Original collection remains unchanged
    expect(result.toArray()).toEqual([2, 4, 6]) // Transformed result
  })

  it('should allow method chaining after make', () => {
    const collection = collect([1, 2, 3, 4])
    const result = collection.make((item: number) => item * 2).filter((item: number) => item > 4)
    expect(result.toArray()).toEqual([6, 8])
  })

  it('should handle mixed types in a collection', () => {
    const collection = collect([1, 'string', { key: 'value' }])
    const result = collection.make((item: number | string | object) => {
      if (typeof item === 'number') return item * 2
      if (typeof item === 'string') return item.toUpperCase()
      return { ...item, transformed: true }
    })
    expect(result.toArray()).toEqual([2, 'STRING', { key: 'value', transformed: true }])
  })

  it('should support transforming values with their index as an argument', () => {
    const collection = collect(['a', 'b', 'c'])
    const result = collection.make((item: string, index: number) => `${index}: ${item}`)
    expect(result.toArray()).toEqual(['0: a', '1: b', '2: c'])
  })
})
