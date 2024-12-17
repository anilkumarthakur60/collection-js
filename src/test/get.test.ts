// import { collect } from '../collect';

import { collect } from '../collect'

describe('Collection.get', () => {
  it('should return the value for an existing key', () => {
    const data = { name: 'Taylor', framework: 'Laravel' }
    const collection = collect(data)

    expect(collection.get('name')).toBe('Taylor')
    expect(collection.get('framework')).toBe('Laravel')
  })

  it('should return the default value for a non-existing key', () => {
    const data = { name: 'Taylor' }
    const collection = collect(data)

    expect(collection.get('age', 34)).toBe(34)
  })

  it('should return the result of a callback as default value', () => {
    const data = { name: 'Taylor' }
    const collection = collect(data)

    expect(collection.get('email', () => 'taylor@example.com')).toBe('taylor@example.com')
  })

  it('should return undefined for a non-existing key with no default', () => {
    const data = { name: 'Taylor' }
    const collection = collect(data)

    expect(collection.get('age')).toBeUndefined()
  })

  it('should handle mixed value types for default values', () => {
    const data = { name: 'Taylor' }
    const collection = collect(data)

    expect(collection.get('age', null)).toBe(null)
    expect(collection.get('age', 0)).toBe(0)
    expect(collection.get('age', '')).toBe('')
    expect(collection.get('age', false)).toBe(false)
  })
})
