import { collect } from '../collect'

describe('forget', () => {
  it('should remove the item at the given index', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(2).all()
    expect(result).toEqual([1, 2, 4, 5])
  })

  it('should handle removing the first item', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(0).all()
    expect(result).toEqual([2, 3, 4, 5])
  })

  it('should handle removing the last item', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(4).all()
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('should return the same collection if the index is out of bounds', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(10).all()
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle an empty collection', () => {
    const collection = collect([])
    const result = collection.forget(0).all()
    expect(result).toEqual([])
  })

  it('should handle removing an item from a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const result = collection.forget(1).all()
    expect(result).toEqual([{ id: 1 }, { id: 3 }])
  })
  it('should remove a specific key from all objects in the collection', () => {
    const collection = collect([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ])
    const result = collection.forget('name')
    expect(result.toArray()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('should handle removing a non-existent key gracefully', () => {
    const collection = collect([{ id: 1 }, { id: 2 }])
    const result = collection.forget('name')
    expect(result.toArray()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.forget('id')
    expect(result.toArray()).toEqual([])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([{ id: 1, name: 'Alice' }])
    const result = collection.forget('name')
    expect(collection.toArray()).toEqual([{ id: 1, name: 'Alice' }]) // Original remains unchanged
    expect(result.toArray()).toEqual([{ id: 1 }]) // Transformed collection
  })
})
