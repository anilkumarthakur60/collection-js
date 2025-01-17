import { collect } from '../collect'

describe('duplicates', () => {
  it('The duplicates method retrieves and returns unique duplicate values from the collection:', () => {
    const collection = collect([1, 2, 3, 2, 4, 5, 3])
    expect(collection.duplicates().toArray()).toEqual([2, 3])
  })

  it('The duplicates method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'cherry', 'apple', 'banana'])
    expect(collection.duplicates().toArray()).toEqual(['apple', 'banana'])
  })

  it('The duplicates method works with objects and keys:', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'John' },
      { id: 4, name: 'Doe' },
      { id: 5, name: 'Jane' }
    ])
    expect(collection.duplicates('name').toArray()).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  })

  it('The duplicates method works with mixed data types:', () => {
    const collection = collect([1, 'apple', true, 1, 'apple', false])
    expect(collection.duplicates().toArray()).toEqual([1, 'apple'])
  })

  it('The duplicates method returns an empty collection if there are no duplicates:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.duplicates().toArray()).toEqual([])
  })
})
