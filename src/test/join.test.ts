import { collect } from '../collect'

describe('Collection.join', () => {
  it('should join values from the specified key with a separator', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.name)

    expect(result).toBe('Alice, Bob, Charlie')
  })

  it('should return an empty string for an empty collection', () => {
    const data: { id: number; name: string }[] = []

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.name)

    expect(result).toBe('')
  })

  it('should handle non-existing keys gracefully', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2 }, // Missing 'name'
      { id: 3, name: 'Charlie' }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.name)

    expect(result).toBe('Alice, Charlie')
  })

  it('should handle mixed value types', () => {
    const data = [
      { id: 1, value: 123 },
      { id: 2, value: true },
      { id: 3, value: 'Hello' }
    ]

    const collection = collect(data)
    const result = collection.join(' | ', 'value')

    expect(result).toBe('123 | true | Hello')
  })

  it('should handle a single item in the collection', () => {
    const data = [{ id: 1, name: 'Alice' }]

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.name)

    expect(result).toBe('Alice')
  })

  it('should join values from nested object properties', () => {
    const data = [
      { id: 1, user: { name: 'Alice' } },
      { id: 2, user: { name: 'Bob' } },
      { id: 3, user: { name: 'Charlie' } }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.user.name)

    expect(result).toBe('Alice, Bob, Charlie')
  })

  it('should join values with a custom callback function', () => {
    const data = [
      { id: 1, firstName: 'Alice', lastName: 'Smith' },
      { id: 2, firstName: 'Bob', lastName: 'Johnson' },
      { id: 3, firstName: 'Charlie', lastName: 'Brown' }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => `${item.firstName} ${item.lastName}`)

    expect(result).toBe('Alice Smith, Bob Johnson, Charlie Brown')
  })

  it('should join primitive values in the collection', () => {
    const data = [1, 2, 3, 4]

    const collection = collect(data)
    const result = collection.join('-', (item) => item)

    expect(result).toBe('1-2-3-4')
  })

  it('should join values with mixed object and primitive types', () => {
    const data = [
      { id: 1, name: 'Alice' },
      42, // Primitive
      { id: 3, name: 'Charlie' }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => (typeof item === 'object' ? item.name : item))

    expect(result).toBe('Alice, 42, Charlie')
  })
  it('should skip null or undefined values in the collection', () => {
    const data = [{ id: 1, name: 'Alice' }, null, { id: 2, name: 'Bob' }, undefined]

    const collection = collect(data)
    const result = collection.join(', ', (item) => (item ? item.name : ''))

    expect(result).toBe('Alice, Bob')
  })
  it('should join values with custom separators containing special characters', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const collection = collect(data)
    const result = collection.join(' ** ', (item) => item.name)

    expect(result).toBe('Alice ** Bob')
  })
  it('should handle empty string or falsy values in the collection', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: '' }, // Empty string
      { id: 3, name: 'Charlie' }
    ]

    const collection = collect(data)
    const result = collection.join(', ', (item) => item.name)

    expect(result).toBe('Alice, Charlie')
  })

  it('should preserve spaces in the separator', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    const collection = collect(data)
    const result = collection.join(' , ', (item) => item.name)

    expect(result).toBe('Alice , Bob')
  })
})
