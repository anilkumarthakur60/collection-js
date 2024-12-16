import { collect } from '../collect'

describe('mapWithKeys', () => {
  it('should map a collection of numbers to key-value pairs', () => {
    const collection = collect([1, 2, 3])
    const result = collection.mapWithKeys((item: number) => [`key${item}`, item * 10])
    expect(result).toEqual({
      key1: 10,
      key2: 20,
      key3: 30
    })
  })

  it('should map a collection of objects to key-value pairs', () => {
    const collection = collect([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ])
    const result = collection.mapWithKeys((item: { id: number; name: string }) => [
      item.name,
      item.id
    ])
    expect(result).toEqual({
      Alice: 1,
      Bob: 2
    })
  })

  it('should override keys with the last occurrence when duplicates exist', () => {
    const collection = collect([1, 2, 2, 3])
    const result = collection.mapWithKeys((item: number) => [`key${item}`, item * 10])
    expect(result).toEqual({
      key1: 10,
      key2: 20,
      key3: 30
    })
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.mapWithKeys((item: number) => [`key${item}`, item * 10])
    expect(result).toEqual({})
  })

  // it('should handle collections of mixed types', () => {
  //   const collection = collect([1, 'two', { key: 'three' }])
  //   const result = collection.mapWithKeys((item: number | string | { key: string }) => {
  //     if (typeof item === 'number') return [`number${item}`, item * 10]
  //     if (typeof item === 'string') return [item, item.toUpperCase()]
  //     if (typeof item === 'object') return [item.key, Object.keys(item).length]
  //   })
  //   expect(result).toEqual({
  //     number1: 10,
  //     two: 'TWO',
  //     three: 1, // 1 key in the object
  //   })
  // })

  // it('should map nested arrays to key-value pairs', () => {
  //   const collection = collect([
  //     ['a', 1],
  //     ['b', 2],
  //   ])
  //   const result = collection.mapWithKeys(([key, value]: [string, number]) => [key, value * 10])
  //   expect(result).toEqual({
  //     a: 10,
  //     b: 20,
  //   })
  // })

  it('should handle callback returning complex keys and values', () => {
    const collection = collect([1, 2])
    const result = collection.mapWithKeys((item: number) => [
      `nested.key.${item}`,
      { value: item * 100 }
    ])
    expect(result).toEqual({
      'nested.key.1': { value: 100 },
      'nested.key.2': { value: 200 }
    })
  })

  it('should allow keys derived dynamically from items', () => {
    const collection = collect([
      { category: 'fruit', name: 'apple' },
      { category: 'fruit', name: 'banana' },
      { category: 'vegetable', name: 'carrot' }
    ])
    const result = collection.mapWithKeys((item: { category: string; name: string }) => [
      item.name,
      item.category
    ])
    expect(result).toEqual({
      apple: 'fruit',
      banana: 'fruit',
      carrot: 'vegetable'
    })
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3])
    const result = collection.mapWithKeys((item: number) => [`key${item}`, item * 10])
    expect(collection.toArray()).toEqual([1, 2, 3]) // Original collection unchanged
    expect(result).toEqual({
      key1: 10,
      key2: 20,
      key3: 30
    })
  })
})
