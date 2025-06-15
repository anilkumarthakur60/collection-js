import { collect } from '../collect'

describe('mapToGroups', () => {
  it('should group a collection of numbers by a simple modulo operation', () => {
    const collection = collect([1, 2, 3, 4, 5, 6])
    const result = collection.mapToGroups((item: number) => [item % 2 === 0 ? 'even' : 'odd', item])
    expect(result).toEqual({
      even: [2, 4, 6],
      odd: [1, 3, 5]
    })
  })

  it('should group a collection of objects by a specific property', () => {
    const collection = collect([
      { id: 1, type: 'fruit' },
      { id: 2, type: 'vegetable' },
      { id: 3, type: 'fruit' }
    ])
    const result = collection.mapToGroups((item: { id: number; type: string }) => [item.type, item])
    expect(result).toEqual({
      fruit: [
        { id: 1, type: 'fruit' },
        { id: 3, type: 'fruit' }
      ],
      vegetable: [{ id: 2, type: 'vegetable' }]
    })
  })

  it('should group strings by their first letter', () => {
    const collection = collect(['apple', 'banana', 'cherry', 'avocado', 'blueberry'])
    const result = collection.mapToGroups((item: string) => [item[0], item])
    expect(result).toEqual({
      a: ['apple', 'avocado'],
      b: ['banana', 'blueberry'],
      c: ['cherry']
    })
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.mapToGroups((item: unknown) => ['group', item])
    expect(result).toEqual({})
  })

  it('should handle grouping with mixed types', () => {
    const collection = collect([1, 'two', { key: 'three' }])
    const result = collection.mapToGroups((item: number | string | { key: string }) => {
      if (typeof item === 'number') return ['numbers', item.toString()] as ['numbers', string]
      if (typeof item === 'string') return ['strings', item]
      if (typeof item === 'object') return ['objects', JSON.stringify(item)] as ['objects', string]
      throw new Error('Unexpected item type')
    })
    expect(result).toEqual({
      numbers: ['1'],
      strings: ['two'],
      objects: ['{"key":"three"}']
    })
  })

  it('should allow dynamic keys based on computed values', () => {
    const collection = collect([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 20 },
      { name: 'Charlie', age: 30 }
    ])
    const result = collection.mapToGroups((item: { name: string; age: number }) => [
      `age_${item.age}`,
      item.name
    ])
    expect(result).toEqual({
      age_30: ['Alice', 'Charlie'],
      age_20: ['Bob']
    })
  })

  it('should handle grouping with nested arrays', () => {
    const collection = collect([
      ['group1', 1],
      ['group2', 2],
      ['group1', 3]
    ])
    const result = collection.mapToGroups((item: (string | number)[]) => {
      const [key, value] = item as [string, number]
      return [key, value]
    })
    expect(result).toEqual({
      group1: [1, 3],
      group2: [2]
    })
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3, 4])
    const result = collection.mapToGroups((item: number) => [item % 2 === 0 ? 'even' : 'odd', item])
    expect(collection.toArray()).toEqual([1, 2, 3, 4])
    expect(result).toEqual({
      even: [2, 4],
      odd: [1, 3]
    })
  })

  it('should handle grouping by a fixed key for all items', () => {
    const collection = collect(['a', 'b', 'c'])
    const result = collection.mapToGroups((item: string) => ['letters', item])
    expect(result).toEqual({
      letters: ['a', 'b', 'c']
    })
  })

  it('should group numbers by whether they are positive or negative', () => {
    const collection = collect([-1, -2, 3, 4, 0])
    const result = collection.mapToGroups((item: number) => [
      item > 0 ? 'positive' : item < 0 ? 'negative' : 'zero',
      item
    ])
    expect(result).toEqual({
      positive: [3, 4],
      negative: [-1, -2],
      zero: [0]
    })
  })
})
