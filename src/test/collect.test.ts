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
      const collection = collect([[1, 2], [3, 4]]);
      const result = collection.mapSpread((a, b) => a + b);
      expect(result.all()).toEqual([3, 7]);
    });

    it('should return an empty array when the collection is empty', () => {
      const collection = collect([]);
      const result = collection.mapSpread((a, b) => a + b);
      expect(result.all()).toEqual([]);
    });
  });

  describe('eachSpread', () => {
    it('should correctly call the callback for each item by spreading array elements as arguments', () => {
      const collection = collect([[1, 2], [3, 4]]);
      const mockCallback = jest.fn();
      collection.eachSpread(mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenCalledWith(1, 2);
      expect(mockCallback).toHaveBeenCalledWith(3, 4);
    });

    it('should not call the callback when the collection is empty', () => {
      const collection = collect<number[][]>([]);
      const mockCallback = jest.fn();
      collection.eachSpread(mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});