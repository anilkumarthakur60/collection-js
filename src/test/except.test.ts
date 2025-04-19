import { collect } from '../collect';

describe('Collection except method', () => {
  it('should return all items except those with the specified keys', () => {
    const collection = collect([
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
      { id: 3, name: 'Doe', age: 35 },
    ]);
    const result = collection.except(['age']).toArray();
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Doe' },
    ]);
  });

  it('should work with multiple keys', () => {
    const collection = collect([
      { id: 1, name: 'John', age: 30, gender: 'male' },
      { id: 2, name: 'Jane', age: 25, gender: 'female' },
      { id: 3, name: 'Doe', age: 35, gender: 'male' },
    ]);
    const result = collection.except(['age', 'gender']).toArray();
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Doe' },
    ]);
  });

  it('should work with an empty collection', () => {
    const collection = collect([]);
    const result = collection.except(['age']).toArray();
    expect(result).toEqual([]);
  });

  it('should not modify the original collection', () => {
    const collection = collect([
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]);
    const result = collection.except(['age']).toArray();
    expect(collection.toArray()).toEqual([
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]);
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  });

  it('should allow method chaining', () => {
    const collection = collect([
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ]);
    const result = collection.except(['age']).each(item => item).toArray();
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  });
});
