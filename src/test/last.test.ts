import { collect } from '../collect'

describe('last', () => {
  it('should return the last element of the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.last()).toEqual(5)
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    expect(collection.last()).toBeUndefined()
  })

  it('should return the last element matching a predicate', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.last((item: number) => item % 2 === 0) // Last even number
    expect(result).toEqual(4)
  })

  it('should return undefined if no element matches the predicate', () => {
    const collection = collect([1, 3, 5, 7])
    const result = collection.last((item: number) => item % 2 === 0) // No even numbers
    expect(result).toBeUndefined()
  })

  it('should return the last object matching a predicate', () => {
    const collection = collect([
      { id: 1, active: false },
      { id: 2, active: true },
      { id: 3, active: true }
    ])
    const result = collection.last((item: { id: number; active: boolean }) => item.active)
    expect(result).toEqual({ id: 3, active: true })
  })

  it('should work with strings in the collection', () => {
    const collection = collect(['apple', 'banana', 'cherry', 'date'])
    expect(collection.last()).toEqual('date')
  })

  it('should support a predicate for strings', () => {
    const collection = collect(['apple', 'banana', 'cherry', 'date'])
    const result = collection.last((item: string) => item.startsWith('b'))
    expect(result).toEqual('banana')
  })

  it('should handle nested arrays', () => {
    const collection = collect([1, [2, 3], [4, 5]])
    expect(collection.last()).toEqual([4, 5])
  })

  it('should handle collections with mixed types', () => {
    const collection = collect([1, 'string', { key: 'value' }, [1, 2]])
    expect(collection.last()).toEqual([1, 2])
  })

  it('should allow method chaining after using last', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.last((item: number) => item % 2 === 0) // Last even number
    expect(result).toEqual(4)
    // Verify the original collection remains intact
    expect(collection.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('should throw an error with a custom error message if no match is found and an error function is used', () => {
    const collection = collect([1, 3, 5, 7])
    expect(() => {
      collection.last(
        (item: number) => item % 2 === 0, // No even numbers
        () => {
          throw new Error('No matching element found')
        }
      )
    }).toThrowError('No matching element found')
  })
})
