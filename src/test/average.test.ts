import { collect } from "../collect"

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