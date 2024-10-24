import { collect } from '../collect'
describe('collect function', () => {
  it('should return an empty collection when no items are provided', () => {
    const result = collect([1, 2, 3, 4])
      .filter((n) => n > 2)
      .map((n) => n * 2)
      .all()

    expect(result).toEqual([6, 8])
  })
})
describe('Collection', () => {
  describe('mapSpread', () => {
    it('should correctly map items by spreading array elements as arguments to the callback', () => {
      const collection = collect([
        [1, 2],
        [3, 4]
      ])
      const result = collection.mapSpread((a, b) => a + b)
      expect(result.all()).toEqual([3, 7])
    })

    it('should return an empty array when the collection is empty', () => {
      const collection = collect([])
      const result = collection.mapSpread((a, b) => a + b)
      expect(result.all()).toEqual([])
    })
  })

  describe('eachSpread', () => {
    it('should correctly call the callback for each item by spreading array elements as arguments', () => {
      const collection = collect([
        [1, 2],
        [3, 4]
      ])
      const mockCallback = jest.fn()
      collection.eachSpread(mockCallback)
      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenCalledWith(1, 2)
      expect(mockCallback).toHaveBeenCalledWith(3, 4)
    })

    it('should not call the callback when the collection is empty', () => {
      const collection = collect<number[][]>([])
      const mockCallback = jest.fn()
      collection.eachSpread(mockCallback)
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })
})

describe('after', () => {
  it('The after method returns the item after the given item. null is returned if the given item is not found or is the last item:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.after(3)).toBe(4)
    expect(collection.after(5)).toBe(null)
  })

  it('The after method supports loose comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after('4')).toBe(6)
  })

  it('The after method supports strict comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after('4', true)).toBe(null)
  })

  it('The after method supports custom closure:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after((item: number) => item > 5)).toBe(8)
  })
})

describe('all', () => {
  it('The all method returns all items in the collection:', () => {
    const collection = collect([1, 2, 3, 4])
    expect(collection.all()).toEqual([1, 2, 3, 4])
  })

  it('The all method returns all items in the collection that pass the truth test provided as the first argument to the method:', () => {
    const collection = collect([1, 2, 3, 4])
    expect(collection.all((value) => value > 2)).toEqual([3, 4])
  })
})

describe('average', () => {
  it('The average method returns the average of a list of numbers:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.average()).toBe(3)
  })

  it('The average method returns 0 for an empty collection:', () => {
    const collection = collect([])
    expect(collection.average()).toBe(0)
  })

  it('The average method returns the average of a specific attribute in a collection of objects:', () => {
    const collection = collect([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 }
    ])
    expect(collection.average((item) => item.age)).toBe(30)
  })

  it('The average method returns the average based on a custom callback:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.average((item) => item * 2)).toBe(6)
  })

  it('The average method handles mixed data types correctly:', () => {
    const collection = collect([1, '2', 3, '4', 5])
    expect(collection.average()).toBe(3)
  })

  it('The average method handles nested object structures:', () => {
    const collection = collect([
      { data: { value: 10 } },
      { data: { value: 20 } },
      { data: { value: 30 } }
    ])
    expect(collection.average((item) => item.data.value)).toBe(20)
  })

  it('The average method handles a collection with boolean values (treated as 1 for true and 0 for false):', () => {
    const collection = collect([true, false, true, true, false])
    expect(collection.average()).toBe(0.6)
  })
})

describe('avg', () => {
  it('The avg method returns the avg of a list of numbers:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.avg()).toBe(3)
  })

  it('The avg method returns 0 for an empty collection:', () => {
    const collection = collect([])
    expect(collection.avg()).toBe(0)
  })

  it('The avg method returns the avg of a specific attribute in a collection of objects:', () => {
    const collection = collect([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 }
    ])
    expect(collection.avg((item) => item.age)).toBe(30)
  })

  it('The avg method returns the avg based on a custom callback:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.avg((item) => item * 2)).toBe(6)
  })

  it('The avg method handles mixed data types correctly:', () => {
    const collection = collect([1, '2', 3, '4', 5])
    expect(collection.avg()).toBe(3)
  })

  it('The avg method handles nested object structures:', () => {
    const collection = collect([
      { data: { value: 10 } },
      { data: { value: 20 } },
      { data: { value: 30 } }
    ])
    expect(collection.avg((item) => item.data.value)).toBe(20)
  })

  it('The avg method handles a collection with boolean values (treated as 1 for true and 0 for false):', () => {
    const collection = collect([true, false, true, true, false])
    expect(collection.avg()).toBe(0.6)
  })
})

describe('before', () => {
  it('The before method returns the item before the given item. null is returned if the given item is not found or is the first item:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.before(3)).toBe(2)
    expect(collection.before(1)).toBe(null)
  })

  it('The before method supports loose comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.before('4')).toBe(2)
  })

  it('The before method supports strict comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.before('4', true)).toBe(null)
  })

  it('The before method supports custom closure:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.before((item: number) => item > 5)).toBe(4)
  })
})

// Tests
describe('chunk', () => {
  it('The chunk method splits the collection into chunks of the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const chunks = collection.chunk(2)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 2], [3, 4], [5]])
  })

  it('The chunk method handles cases where the last chunk is smaller than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    const chunks = collection.chunk(3)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method returns an empty collection when the size is zero or negative:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.chunk(0).all()).toEqual([])
    expect(collection.chunk(-1).all()).toEqual([])
  })

  it('The chunk method works correctly with different data types:', () => {
    const collection = collect(['a', 'b', 'c', 'd'])
    const chunks = collection.chunk(2)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ])
  })

  it('The chunk method handles an empty collection correctly:', () => {
    const collection = collect([])
    expect(collection.chunk(2).all()).toEqual([])
  })
})

describe('chunkWhile', () => {
  it('The chunkWhile method splits the collection into chunks based on the predicate:', () => {
    const collection = collect([1, 2, 2, 3, 4, 4, 4, 5, 6])
    const chunks = collection.chunkWhile(
      (item: number, index: number, array: number[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([
      [1],
      [2, 2],
      [3],
      [4, 4, 4],
      [5],
      [6]
    ])
  })

  it('The chunkWhile method handles a collection where all items are in one chunk:', () => {
    const collection = collect([1, 1, 1, 1, 1])
    const chunks = collection.chunkWhile(
      (item: number, index: number, array: number[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 1, 1, 1, 1]])
  })

  it('The chunkWhile method handles a collection where each item is a separate chunk:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const chunks = collection.chunkWhile(() => false)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1], [2], [3], [4], [5]])
  })

  it('The chunkWhile method handles an empty collection:', () => {
    const collection = collect<number>([])
    const chunks = collection.chunkWhile(() => true)
    expect(chunks.all()).toEqual([])
  })

  it('The chunkWhile method works correctly with different data types:', () => {
    const collection = collect(['a', 'b', 'b', 'c', 'd', 'd'])
    const chunks = collection.chunkWhile(
      (item: string, index: number, array: string[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([['a'], ['b', 'b'], ['c'], ['d', 'd']])
  })
})

describe('collapse', () => {
  it('The collapse method flattens a collection of arrays into a single, flat collection:', () => {
    const collection = collect([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('The collapse method handles an empty collection of arrays:', () => {
    const collection = collect<number[][]>([])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([])
  })

  it('The collapse method handles a collection with some empty arrays:', () => {
    const collection = collect([[1, 2], [], [3, 4]])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([1, 2, 3, 4])
  })

  it('The collapse method works correctly with different data types:', () => {
    const collection = collect([
      ['a', 'b'],
      ['c', 'd']
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('The collapse method handles nested arrays correctly:', () => {
    const collection = collect([
      [
        [1, 2],
        [3, 4]
      ],
      [
        [5, 6],
        [7, 8]
      ]
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ])
  })
})
describe('collect', () => {
  it('The collect method returns a new Collection instance with the items currently in the collection:', () => {
    const original = collect([1, 2, 3, 4, 5])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([1, 2, 3, 4, 5])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with an empty collection:', () => {
    const original = collect<number>([])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with different data types:', () => {
    const original = collect(['a', 'b', 'c'])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual(['a', 'b', 'c'])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with nested arrays:', () => {
    const original = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })
})
describe('concat', () => {
  it('The concat method appends the given array values onto the end of the collection:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat(['Jane Doe']).concat(['Johnny Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 'Jane Doe', 'Johnny Doe'])
  })

  it('The concat method appends the given collection values onto the end of the collection:', () => {
    const collection = collect(['John Doe'])
    const otherCollection = collect(['Jane Doe'])
    const concatenated = collection.concat(otherCollection).concat(['Johnny Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 'Jane Doe', 'Johnny Doe'])
  })

  it('The concat method works correctly with an empty array:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat([])
    expect(concatenated.all()).toEqual(['John Doe'])
  })

  it('The concat method works correctly with an empty collection:', () => {
    const collection = collect(['John Doe'])
    const otherCollection = collect<string>([])
    const concatenated = collection.concat(otherCollection)
    expect(concatenated.all()).toEqual(['John Doe'])
  })

  it('The concat method works correctly with different data types:', () => {
    const collection = collect(['John Doe'])
    const concatenated = collection.concat([123, true, 'Jane Doe'])
    expect(concatenated.all()).toEqual(['John Doe', 123, true, 'Jane Doe'])
  })
})

describe('contains', () => {
  it('The contains method determines if the collection contains a given item:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.contains(3)).toBe(true)
    expect(collection.contains(6)).toBe(false)
  })

  it('The contains method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    expect(collection.contains('banana')).toBe(true)
    expect(collection.contains('grape')).toBe(false)
  })

  it('The contains method works with a predicate function:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.contains((item) => item > 4)).toBe(true)
    expect(collection.contains((item) => item > 5)).toBe(false)
  })

  it('The contains method works with complex objects:', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(collection.contains((item) => item.id === 2)).toBe(true)
    expect(collection.contains((item) => item.id === 4)).toBe(false)
  })

  it('The contains method works with mixed data types:', () => {
    const collection = collect([1, 'apple', true])
    expect(collection.contains('apple')).toBe(true)
    expect(collection.contains(false)).toBe(false)
  })
})
