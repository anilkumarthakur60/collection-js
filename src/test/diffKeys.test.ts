import { collect } from "../collect"

describe('diffKeys method', () => {
  it('The diffKeys method returns the key/value pairs in the original collection that are not present in the given collection', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Doe' }]);
    const otherCollection = collect([{ id: 2, name: 'Jane' }]);
    const result = collection.diffKeys(otherCollection);
    expect(result).toEqual(collect([{ id: 1, name: 'John' }, { id: 3, name: 'Doe' }]));
  });

  it('The diffKeys method works with nested objects', () => {
    const collection = collect([{ id: 1, details: { name: 'John', age: 30 } }, { id: 2, details: { name: 'Jane', age: 25 } }]);
    const otherCollection = collect([{ id: 2, details: { name: 'Jane', age: 25 } }]);
    const result = collection.diffKeys(otherCollection);
    expect(result).toEqual(collect([{ id: 1, details: { name: 'John', age: 30 } }]));
  });

  it('The diffKeys method returns an empty collection if all keys are present in the given collection', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
    const otherCollection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
    const result = collection.diffKeys(otherCollection);
    expect(result).toEqual(collect([]));
  });

  it('The diffKeys method returns the original collection if no keys are present in the given collection', () => {
    const collection = collect([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
    const otherCollection = collect([{ id: 3, name: 'Doe' }]);
    const result = collection.diffKeys(otherCollection);
    expect(result).toEqual(collection);
  });
});
