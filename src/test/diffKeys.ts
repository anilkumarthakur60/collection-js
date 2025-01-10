// import { skip } from 'node:test';
// import { collect } from '../collect'

// // describe('diffKeys method', () => {
// //   it('The diffKeys method returns the items whose keys are not present in the given array', () => {
// //     const collection = collect([{ one: 10, two: 20, three: 30, four: 40, five: 50 }]);
// //     const other = [{ two: 2, four: 4, six: 6, eight: 8 }];
// //     const result = collection.diffKeys(other);
// //     expect(result.all()).toEqual([{ one: 10, three: 30, five: 50 }]);
// //   });
// //
// //   it('The diffKeys method returns the items whose keys are not present in the given collection', () => {
// //     const collection = collect([{ one: 10, two: 20, three: 30, four: 40, five: 50 }]);
// //     const otherCollection = collect([{ two: 2, four: 4, six: 6, eight: 8 }]);
// //     const result = collection.diffKeys(otherCollection);
// //     expect(result.all()).toEqual([{ one: 10, three: 30, five: 50 }]);
// //   });
// //
// //   it('The diffKeys method works with nested objects', () => {
// //     const collection = collect([{ one: { value: 10 }, two: { value: 20 }, three: { value: 30 } }]);
// //     const other = [{ two: { value: 2 } }];
// //     const result = collection.diffKeys(other);
// //     expect(result.all()).toEqual([{ one: { value: 10 }, three: { value: 30 } }]);
// //   });
// //
// //   it('The diffKeys method returns the original collection if no keys are present in the given array', () => {
// //     const collection = collect([{ one: 10, two: 20 }]);
// //     const other = [{}];
// //     const result = collection.diffKeys(other);
// //     expect(result.all()).toEqual([{ one: 10, two: 20 }]);
// //   });
// //
// //   it('The diffKeys method returns an empty collection if all keys are present in the given array', () => {
// //     const collection = collect([{ one: 10, two: 20 }]);
// //     const other = [{ one: 1, two: 2 }];
// //     const result = collection.diffKeys(other);
// //     expect(result.all()).toEqual([]);
// //   });
// //
// //   it('The diffKeys method works with mixed data types', () => {
// //     const collection = collect([{ one: 'John', two: 100, three: true }]);
// //     const other = [{ two: 2 }];
// //     const result = collection.diffKeys(other);
// //     expect(result.all()).toEqual([{ one: 'John', three: true }]);
// //   });
// // });

// interface TestItem {
//   a?: number;
//   b?: number;
//   c?: number;
//   d?: number;
// }

// describe('Collection diffKeys method', () => {
//   it('should return items with keys not present in the other collection', () => {
//     const collection1 = collect<TestItem>([{ a: 1, b: 2 }, { c: 3, d: 4 }]);
//     const collection2 = collect<TestItem>([{ a: 1 }, { d: 4 }]);

//     const result = collection1.diffKeys(collection2);

//     expect(result.all()).toEqual([{ c: 3, d: 4 }]);
//   });
//   //
//   // it('should return items with keys not present in the other array', () => {
//   //   const collection = collect<TestItem>([{ a: 1, b: 2 }, { c: 3, d: 4 }]);
//   //   const otherArray: TestItem[] = [{ a: 1 }, { d: 4 }];
//   //
//   //   const result = collection.diffKeys(otherArray);
//   //
//   //   expect(result.all()).toEqual([{ c: 3, d: 4 }]);
//   // });
//   //
//   // it('should return empty collection when all keys are present in the other collection', () => {
//   //   const collection1 = collect<TestItem>([{ a: 1, b: 2 }]);
//   //   const collection2 = collect<TestItem>([{ a: 1 }, { b: 2 }]);
//   //
//   //   const result = collection1.diffKeys(collection2);
//   //
//   //   expect(result.all()).toEqual([]);
//   // });
//   //
//   // it('should return the same collection when other collection is empty', () => {
//   //   const collection1 = collect<TestItem>([{ a: 1, b: 2 }, { c: 3, d: 4 }]);
//   //   const collection2 = collect<TestItem>([]);
//   //
//   //   const result = collection1.diffKeys(collection2);
//   //
//   //   expect(result.all()).toEqual([{ a: 1, b: 2 }, { c: 3, d: 4 }]);
//   // });
//   //
//   // it('should return empty collection when the collection is empty', () => {
//   //   const collection1 = collect<TestItem>([]);
//   //   const collection2 = collect<TestItem>([{ a: 1, b: 2 }, { c: 3, d: 4 }]);
//   //
//   //   const result = collection1.diffKeys(collection2);
//   //
//   //   expect(result.all()).toEqual([]);
//   // });
//   //
//   // it('should handle mixed type collections correctly', () => {
//   //   const collection1 = collect<TestItem>([{ a: 1 }, { b: 2 }, { a: 1, b: 2, c: 3 }]);
//   //   const collection2 = collect<TestItem>([{ a: 1 }, { c: 3 }]);
//   //
//   //   const result = collection1.diffKeys(collection2);
//   //
//   //   expect(result.all()).toEqual([{ b: 2 }, { a: 1, b: 2, c: 3 }]);
//   // });
// });
