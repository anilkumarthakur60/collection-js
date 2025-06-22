import { collect } from '../collect'

describe('flatten', () => {
  it('should flatten a simple nested array', () => {
    const collection = collect([1, [2, [3, 4], 5], 6])
    expect(collection.flatten().all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should flatten an already flat array', () => {
    const collection = collect([1, 2, 3, 4, 5, 6])
    expect(collection.flatten().all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle an empty array', () => {
    const collection = collect([])
    expect(collection.flatten().all()).toEqual([])
  })

  it('should handle deeply nested arrays', () => {
    const collection = collect([1, [2, [3, [4, [5, [6]]]]]])
    expect(collection.flatten().all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle arrays with different types', () => {
    const collection = collect([1, ['a', [true, [null, [undefined, [{ key: 'value' }]]]]]])
    expect(collection.flatten().all()).toEqual([1, 'a', true, null, undefined, { key: 'value' }])
  })

  it('should handle arrays with no nested elements', () => {
    const collection = collect([1, 2, 3])
    expect(collection.flatten().all()).toEqual([1, 2, 3])
  })

  it('should handle arrays with some empty nested arrays', () => {
    const collection = collect([1, [], [2, [3, []], 4], 5])
    expect(collection.flatten().all()).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle a single element array', () => {
    const collection = collect([1])
    expect(collection.flatten().all()).toEqual([1])
  })

  it('should handle a single nested empty array', () => {
    const collection = collect([[]])
    expect(collection.flatten().all()).toEqual([])
  })

  it('should handle nested empty arrays within a non-empty array', () => {
    const collection = collect([1, [[], [2, [], [3, [4, []], 5], []]], 6])
    expect(collection.flatten().all()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('should handle array with multiple levels of empty arrays', () => {
    const collection = collect([1, [[], [[]]], [], 2])
    expect(collection.flatten().all()).toEqual([1, 2])
  })

  it('should handle array with mixed types including objects', () => {
    const collection = collect([
      1,
      ['a', { key: 'value' }, [true, null, [undefined, [{ anotherKey: 'anotherValue' }]]]]
    ])
    expect(collection.flatten().all()).toEqual([
      1,
      'a',
      { key: 'value' },
      true,
      null,
      undefined,
      { anotherKey: 'anotherValue' }
    ])
  })

  it('should handle array with nested arrays and objects', () => {
    const collection = collect([1, [{ key: 'value' }, [2, { anotherKey: 'anotherValue' }, 3]], 4])
    expect(collection.flatten().all()).toEqual([
      1,
      { key: 'value' },
      2,
      { anotherKey: 'anotherValue' },
      3,
      4
    ])
  })

  it('should handle flattening with depth 1', () => {
    const collection = collect([
      'Apple',
      [
        {
          name: 'iPhone 6S',
          brand: 'Apple'
        }
      ],
      'Samsung',
      [
        {
          name: 'Galaxy S7',
          brand: 'Samsung'
        }
      ]
    ])
    expect(collection.flatten(1).all()).toEqual([
      'Apple',
      { name: 'iPhone 6S', brand: 'Apple' },
      'Samsung',
      { name: 'Galaxy S7', brand: 'Samsung' }
    ])
  })

  it('should handle flattening with depth 2', () => {
    const collection = collect([
      'Apple',
      [
        {
          name: 'iPhone 6S',
          brand: 'Apple'
        }
      ],
      'Samsung',
      [
        {
          name: 'Galaxy S7',
          brand: 'Samsung'
        }
      ]
    ])
    expect(collection.flatten(2).all()).toEqual([
      'Apple',
      { name: 'iPhone 6S', brand: 'Apple' },
      'Samsung',
      { name: 'Galaxy S7', brand: 'Samsung' }
    ])
  })

  it('should handle flattening with no depth argument', () => {
    const collection = collect([
      'Apple',
      [
        {
          name: 'iPhone 6S',
          brand: 'Apple'
        }
      ],
      'Samsung',
      [
        {
          name: 'Galaxy S7',
          brand: 'Samsung'
        }
      ]
    ])
    expect(collection.flatten().all()).toEqual([
      'Apple',
      { name: 'iPhone 6S', brand: 'Apple' },
      'Samsung',
      { name: 'Galaxy S7', brand: 'Samsung' }
    ])
  })
})
