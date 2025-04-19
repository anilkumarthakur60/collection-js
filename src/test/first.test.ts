import { collect } from '../collect'

describe('first', () => {
    it('should return the first item in the collection when no predicate is provided', () => {
      const collection = collect([1, 2, 3, 4, 5]);
      const firstItem = collection.first();

      expect(firstItem).toBe(1);
    });

    it('should return null if the collection is empty and no predicate is provided', () => {
      const collection = collect([]);
      const firstItem = collection.first();

      expect(firstItem).toBeNull();
    });

    it('should return the first item that matches the predicate', () => {
      const collection = collect([1, 2, 3, 4, 5]);
      const firstItem = collection.first((item) => item > 3);

      expect(firstItem).toBe(4);
    });

    it('should return null if no items match the predicate', () => {
      const collection = collect([1, 2, 3]);
      const firstItem = collection.first((item) => item > 5);

      expect(firstItem).toBeNull();
    });

    it('should work with a collection of objects', () => {
      const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const firstItem = collection.first((item) => item.id === 2);

      expect(firstItem).toEqual({ id: 2 });
    });

    it('should work with a collection of strings', () => {
      const collection = collect(['a', 'b', 'c']);
      const firstItem = collection.first((item) => item === 'b');

      expect(firstItem).toBe('b');
    });

    it('should return null if the collection is empty and a predicate is provided', () => {
      const collection = collect([]);
      const firstItem = collection.first((item) => item === 1);

      expect(firstItem).toBeNull();
    });
  });
