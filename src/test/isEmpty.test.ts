import { collect } from '../collect'

describe('isEmpty', () => {
  it('should return true for an empty collection', () => {
    const data: number[] = []

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(true)
  })

  it('should return false for a non-empty collection with objects', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false)
  })

  it('should return false for a non-empty collection with primitive values', () => {
    const data = [1, 2, 3]

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false)
  })

  it('should return false for a collection containing falsy values', () => {
    const data = [0, '', false, null, undefined]

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false)
  })

  it('should return true after clearing the collection using splice', () => {
    const data = [1, 2, 3]

    const collection = collect(data)
    collection.splice(0, collection.count()) // Clear all items

    expect(collection.isEmpty()).toBe(true)
  })

  it('should return true after filtering out all items', () => {
    const data = [
      { id: 1, active: false },
      { id: 2, active: false }
    ]

    const collection = collect(data).filter((item) => item.active)
    expect(collection.isEmpty()).toBe(true)
  })

  it('should return false for nested collections that are not empty', () => {
    const data = [
      collect([1, 2, 3]),
      collect([]) // Empty nested collection
    ]

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false)
  })

  it('should return true for a collection containing an empty nested collection', () => {
    const data = [collect([])]

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false) // Outer collection is not empty
    expect(collection.all()[0].isEmpty()).toBe(true) // Inner collection is empty
  })

  it('should return false for a collection with a single item', () => {
    const data = ['single-item']

    const collection = collect(data)
    expect(collection.isEmpty()).toBe(false)
  })

  it('should return true when a collection is initialized without items', () => {
    const collection = collect()
    expect(collection.isEmpty()).toBe(true)
  })
})
