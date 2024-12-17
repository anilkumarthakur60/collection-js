import { collect } from '../collect'

describe('Collection.intersectByKeys', () => {
  it('should retain keys that exist in the provided object', () => {
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 }
    ]

    const other = { name: '', age: '' }

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 }
    ])
  })

  it('should return empty objects if no keys match', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const other = { non_existent_key: '' }

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{}, {}])
  })

  it('should handle an empty provided object', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const other = {}

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([{}, {}])
  })

  it('should handle an empty collection', () => {
    // eslint-disable-next-line
    const data: { [key: string]: any }[] = []

    const other = { id: '', name: '' }

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([])
  })

  it('should retain keys for nested objects', () => {
    const data = [
      { id: 1, details: { name: 'Alice', age: 25 } },
      { id: 2, details: { name: 'Bob', age: 30 } }
    ]

    const other = { details: '' }

    const collection = collect(data)
    const result = collection.intersectByKeys(other)

    expect(result.toArray()).toEqual([
      { details: { name: 'Alice', age: 25 } },
      { details: { name: 'Bob', age: 30 } }
    ])
  })
})
