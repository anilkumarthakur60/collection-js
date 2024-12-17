import { Collection } from '../collect'
import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'

describe('Collection', () => {
  describe('all()', () => {
    it('should return all items when no predicate is provided', () => {
      const collection = new Collection([1, 2, 3])
      expect(collection.all()).toEqual([1, 2, 3])
    })

    it('should filter items based on predicate', () => {
      const collection = new Collection([1, 2, 3, 4])
      expect(collection.all((item) => item % 2 === 0)).toEqual([2, 4])
    })
  })

  describe('average()', () => {
    it('should calculate average with callback', () => {
      const collection = new Collection([{ value: 10 }, { value: 20 }])
      expect(collection.average((item) => item.value)).toBe(15)
    })

    it('should calculate average without callback for numbers', () => {
      const collection = new Collection([1, 2, 3])
      expect(collection.average()).toBe(2)
    })

    it('should return 0 for empty collection', () => {
      const collection = new Collection([])
      expect(collection.average()).toBe(0)
    })
  })

  describe('duplicates()', () => {
    it('should find duplicates with key', () => {
      const collection = new Collection([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'Jack' }
      ])
      const duplicates = collection.duplicates('id')
      expect(duplicates.count()).toBe(1)
      expect(duplicates.first()?.name).toBe('John')
    })

    it('should find duplicates without key', () => {
      const collection = new Collection([1, 2, 2, 3, 3, 3])
      const duplicates = collection.duplicates()
      expect(duplicates.all()).toEqual([2, 3])
    })
  })

  describe('firstOrFail()', () => {
    it('should return first item when exists', () => {
      const collection = new Collection([1, 2, 3])
      expect(collection.firstOrFail()).toBe(1)
    })

    it('should throw ItemNotFoundException when empty', () => {
      const collection = new Collection([])
      expect(() => collection.firstOrFail()).toThrow(ItemNotFoundException)
    })

    it('should return first matching item with predicate', () => {
      const collection = new Collection([1, 2, 3])
      expect(collection.firstOrFail((item) => item > 1)).toBe(2)
    })
  })

  describe('groupBy()', () => {
    it('should group items by key', () => {
      const collection = new Collection([
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 }
      ])

      const grouped = collection.groupBy('category')
      expect(grouped['A'].length).toBe(2)
      expect(grouped['B'].length).toBe(1)
    })
  })

  describe('map()', () => {
    it('should transform items', () => {
      const collection = new Collection([1, 2, 3])
      const mapped = collection.map((item) => item * 2)
      expect(mapped.all()).toEqual([2, 4, 6])
    })
  })

  describe('filter()', () => {
    it('should filter items based on callback', () => {
      const collection = new Collection([1, 2, 3, 4])
      const filtered = collection.filter((item) => item % 2 === 0)
      expect(filtered.all()).toEqual([2, 4])
    })
  })
})
