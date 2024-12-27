import { collect } from '../collect'

describe('diffAssoc method', () => {
  it('The diffAssoc method returns the key/value pairs in the original collection that are not present in the given array', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Doe' }]);
    const otherCollection = collect([{ id: 2, name: 'Jane' }]);
    const result = collection.diffAssoc(otherCollection);
    expect(result.all()).toEqual([{ id: 1, name: 'John' }, { id: 3, name: 'Doe' }]);
  });

  it('The diffAssoc method returns the key/value pairs in the original collection that are not present in the given collection', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Doe' }])
    const otherCollection = collect([{ id: 2, name: 'Jane' }])
    const result = collection.diffAssoc(otherCollection)
    expect(result).toEqual(collect([{ id: 1, name: 'John' }, { id: 3, name: 'Doe' }]))
  })

  it('The diffAssoc method works with nested objects', () => {
    const collection = collect([{ id: 1, details: { name: 'John', age: 30 } }, {
      id: 2,
      details: { name: 'Jane', age: 25 }
    }])
    const result = collection.diffAssoc([{ id: 2, details: { name: 'Jane', age: 25 } }])
    expect(result).toEqual(collect([{ id: 1, details: { name: 'John', age: 30 } }]))
  })

  it('The diffAssoc method returns an empty collection if all key/value pairs are present in the given array', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }])
    const result = collection.diffAssoc([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }])
    expect(result).toEqual(collect([]))
  })

  it('The diffAssoc method returns the original collection if no key/value pairs are present in the given array', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }])
    const result = collection.diffAssoc([{ id: 3, name: 'Doe' }])
    expect(result).toEqual(collection)
  })
})
