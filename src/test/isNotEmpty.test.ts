import { collect } from '../collect'

describe('Collection.isNotEmpty', () => {
  it('should return true for a non-empty collection with objects', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return true for a non-empty collection with primitive values', () => {
    const data = [1, 2, 3, 4]

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return false for an empty collection', () => {
    const data: number[] = []

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(false)
  })

  it('should return true for a collection containing null or undefined values', () => {
    const data = [null, undefined, 0]

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return true after dynamically filtering items to keep some', () => {
    const data = [
      { id: 1, active: true },
      { id: 2, active: false }
    ]

    const collection = collect(data).filter((item) => item.active)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return false after dynamically filtering all items', () => {
    const data = [
      { id: 1, active: false },
      { id: 2, active: false }
    ]

    const collection = collect(data).filter((item) => item.active)
    expect(collection.isNotEmpty()).toBe(false)
  })

  it('should return true for nested collections that are not empty', () => {
    const data = [
      collect([1, 2, 3]),
      collect([]) // Empty nested collection
    ]

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return false for an empty collection after clearing it', () => {
    const data = [1, 2, 3]

    const collection = collect(data)
    collection.splice(0, collection.count()) // Clear the collection
    console.log(collection.all()) // Should print []

    expect(collection.isNotEmpty()).toBe(false)
  })

  it('should handle collections with a single item correctly', () => {
    const data = ['single-item']

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })

  it('should return true for a collection containing falsy values', () => {
    const data = [0, '', false, null, undefined]

    const collection = collect(data)
    expect(collection.isNotEmpty()).toBe(true)
  })
})
