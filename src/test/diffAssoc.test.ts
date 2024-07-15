import { collect } from '../collect'

describe('diffAssoc method', () => {
  it('The diffAssoc method returns the key/value pairs in the original collection that are not present in the given array', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Doe' }
    ])
    const otherCollection = collect([{ id: 2, name: 'Jane' }])
    const result = collection.diffAssoc(otherCollection)
    expect(result.all()).toEqual([
      { id: 1, name: 'John' },
      { id: 3, name: 'Doe' }
    ])
  })

  it('The diffAssoc method returns the key/value pairs in the original collection that are not present in the given collection', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Doe' }
    ])
    const otherCollection = collect([{ id: 2, name: 'Jane' }])
    const result = collection.diffAssoc(otherCollection)
    expect(result.all()).toEqual([
      { id: 1, name: 'John' },
      { id: 3, name: 'Doe' }
    ])
  })

  it('The diffAssoc method works with nested objects', () => {
    const collection = collect([
      { id: 1, details: { name: 'John', age: 30 } },
      { id: 2, details: { name: 'Jane', age: 25 } }
    ])
    const result = collection.diffAssoc([{ id: 2, details: { name: 'Jane', age: 25 } }])
    expect(result.all()).toEqual([{ id: 1, details: { name: 'John', age: 30 } }])
  })

  it('The diffAssoc method returns an empty collection if all key/value pairs are present in the given array', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
    const result = collection.diffAssoc([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
    expect(result.all()).toEqual([])
  })

  it('The diffAssoc method returns the original collection if no key/value pairs are present in the given array', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
    const result = collection.diffAssoc([{ id: 3, name: 'Doe' }])
    expect(result.all()).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  })
  // it('The diffAssoc method works with empty original collection', () => {
  //   const collection = collect([]);
  //   const otherCollection = collect([{ id: 1, name: 'John' }]);
  //   const result = collection.diffAssoc(otherCollection);
  //   expect(result.all()).toEqual([]);
  // });

  it('The diffAssoc method works with empty given array', () => {
    const collection = collect([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
    const result = collection.diffAssoc([])
    expect(result.all()).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  })

  it('The diffAssoc method works with mixed data types', () => {
    const collection = collect([
      { id: 1, value: 'John' },
      { id: 2, value: 100 },
      { id: 3, value: true }
    ])
    const result = collection.diffAssoc([{ id: 2, value: 100 }])
    expect(result.all()).toEqual([
      { id: 1, value: 'John' },
      { id: 3, value: true }
    ])
  })

  it('The diffAssoc method works with arrays in values', () => {
    const collection = collect([
      { id: 1, values: [1, 2, 3] },
      { id: 2, values: [4, 5, 6] }
    ])
    const result = collection.diffAssoc([{ id: 2, values: [4, 5, 6] }])
    expect(result.all()).toEqual([{ id: 1, values: [1, 2, 3] }])
  })

  it('The diffAssoc method works with complex nested structures', () => {
    const collection = collect([
      { id: 1, details: { name: 'John', address: { city: 'NY', zip: '10001' } } },
      { id: 2, details: { name: 'Jane', address: { city: 'LA', zip: '90001' } } }
    ])
    const result = collection.diffAssoc([
      { id: 2, details: { name: 'Jane', address: { city: 'LA', zip: '90001' } } }
    ])
    expect(result.all()).toEqual([
      { id: 1, details: { name: 'John', address: { city: 'NY', zip: '10001' } } }
    ])
  })
})
