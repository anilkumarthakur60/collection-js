import { collect } from '../collect'

class User {
  name: string
  age: number

  constructor({ name, age }: { name: string; age: number }) {
    this.name = name
    this.age = age
  }
}

class Item {
  id: number
  category: string

  constructor({ id, category }: { id: number; category: string }) {
    this.id = id
    this.category = category
  }
}

describe('mapInto', () => {
  it('should map items into instances of a specified class', () => {
    const collection = collect([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 }
    ])
    const result = collection.mapInto(User)
    expect(result.toArray()).toEqual([
      new User({ name: 'Alice', age: 25 }),
      new User({ name: 'Bob', age: 30 })
    ])
  })

  it('should work with nested objects', () => {
    const collection = collect([
      { id: 1, category: 'fruit' },
      { id: 2, category: 'vegetable' }
    ])
    const result = collection.mapInto(Item)
    expect(result.toArray()).toEqual([
      new Item({ id: 1, category: 'fruit' }),
      new Item({ id: 2, category: 'vegetable' })
    ])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.mapInto(User)
    expect(result.toArray()).toEqual([])
  })

  //   it('should throw an error if the provided class constructor is incompatible', () => {
  //     const collection = collect([{ name: 'Alice' }, { name: 'Bob' }])
  //     class InvalidClass {
  //         name: string;
  //         age: number;

  //         constructor(item: { name: string; age: number }) {
  //           this.name = item.name;
  //           this.age = item.age;
  //         }
  //       }

  //     expect(() => collection.mapInto(InvalidClass)).toThrowError(
  //       /InvalidClass is not a valid constructor for the provided items./
  //     )
  //   })

  it('should preserve immutability of the original collection', () => {
    const collection = collect([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 }
    ])
    const result = collection.mapInto(User)
    expect(collection.toArray()).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 }
    ]) // Original collection remains unchanged
    expect(result.toArray()).toEqual([
      new User({ name: 'Alice', age: 25 }),
      new User({ name: 'Bob', age: 30 })
    ])
  })

  it('should handle collections with extra keys in the objects', () => {
    const collection = collect([
      { name: 'Alice', age: 25, extra: true },
      { name: 'Bob', age: 30, active: false }
    ])
    const result = collection.mapInto(User)
    expect(result.toArray()).toEqual([
      new User({ name: 'Alice', age: 25 }),
      new User({ name: 'Bob', age: 30 })
    ])
  })

  it('should map primitive values into instances of a class with a single property', () => {
    class PrimitiveWrapper {
      value: number

      constructor(value: number) {
        this.value = value
      }
    }

    const collection = collect([1, 2, 3])
    const result = collection.mapInto(PrimitiveWrapper)
    expect(result.toArray()).toEqual([
      new PrimitiveWrapper(1),
      new PrimitiveWrapper(2),
      new PrimitiveWrapper(3)
    ])
  })

  it('should handle mixed types gracefully if the class constructor can adapt', () => {
    class FlexibleItem {
      data: unknown

      constructor(data: unknown) {
        this.data = data
      }
    }

    const collection = collect([1, 'string', { key: 'value' }])
    const result = collection.mapInto(FlexibleItem)
    expect(result.toArray()).toEqual([
      new FlexibleItem(1),
      new FlexibleItem('string'),
      new FlexibleItem({ key: 'value' })
    ])
  })
})
