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

//chunk
describe('chunk', () => {
  it('The chunk method breaks the collection into multiple, smaller collections of a given size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    expect(collection.chunk(4).all()).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7]
    ])
  })

  it('The chunk method breaks the collection into multiple, smaller collections of a given size. The last collection may contain less than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    expect(collection.chunk(3).all()).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method breaks the collection into multiple, smaller collections of a given size. The last collection may contain less than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    expect(collection.chunk(3).all()).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method breaks the collection into multiple, smaller collections of a given size. The last collection may contain less than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    expect(collection.chunk(3).all()).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method breaks the collection into multiple, smaller collections of a given size. The last collection may contain less than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    expect(collection.chunk(3).all()).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method breaks the collection into multiple, smaller collections of a given size. The last collection may contain less than the specified size:', () => {
    const collection = collect([1, 2])
    expect(collection.chunk(3).all()).toEqual([[1, 2]])
  })
})
