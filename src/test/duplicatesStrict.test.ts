import { collect } from '../collect'
describe('duplicatesStrict', () => {
  it('The duplicatesStrict method retrieves and returns unique duplicate values from the collection:', () => {
    const collection = collect([1, 2, 3, 2, 4, 5, 3])
    expect(collection.duplicatesStrict().toArray()).toEqual([2, 2, 3, 3])
  })

  it('The duplicatesStrict method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'cherry', 'apple', 'banana'])
    expect(collection.duplicatesStrict().toArray()).toEqual(['apple', 'apple', 'banana', 'banana'])
  })

  it('The duplicatesStrict method works with objects and keys:', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'John' },
      { id: 4, name: 'Doe' },
      { id: 5, name: 'Jane' }
    ])
    expect(collection.duplicatesStrict('name').toArray()).toEqual([
      { id: 1, name: 'John' },
      { id: 3, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 5, name: 'Jane' }
    ])
  })

  it('The duplicatesStrict method works with mixed data types:', () => {
    const collection = collect([1, 'apple', true, 1, 'apple', false])
    expect(collection.duplicatesStrict().toArray()).toEqual([1, 1, 'apple', 'apple'])
  })

  it('The duplicatesStrict method returns an empty collection if there are no duplicates:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.duplicatesStrict().toArray()).toEqual([])
  })
})
