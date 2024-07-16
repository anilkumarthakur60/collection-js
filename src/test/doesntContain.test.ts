import { collect } from '../collect'

describe('doesntContain', () => {
  it('The doesntContain method determines if the collection does not contain a given item:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.doesntContain(3)).toBe(false)
    expect(collection.doesntContain(6)).toBe(true)
  })

  it('The doesntContain method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    expect(collection.doesntContain('banana')).toBe(false)
    expect(collection.doesntContain('grape')).toBe(true)
  })

  it('The doesntContain method works with a predicate function:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.doesntContain((item) => item > 4)).toBe(false)
    expect(collection.doesntContain((item) => item > 5)).toBe(true)
  })

  it('The doesntContain method works with complex objects:', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(collection.doesntContain((item) => item.id === 2)).toBe(false)
    expect(collection.doesntContain((item) => item.id === 4)).toBe(true)
  })

  it('The doesntContain method works with mixed data types:', () => {
    const collection = collect([1, 'apple', true])
    expect(collection.doesntContain('apple')).toBe(false)
    expect(collection.doesntContain(false)).toBe(true)
    expect(collection.doesntContain(1)).toBe(false)
    expect(collection.doesntContain(true)).toBe(false)
  })

  it('The doesntContain method works with key-value pairs:', () => {
    const collection = collect([
      { name: 'John Doe', age: 25 },
      { name: 'Jane Doe', age: 24 },
      { name: 'Johnny Doe', age: 30 },
      { name: 'Janie Doe', age: 29 },
      { name: 'John Doe', age: 27 }
    ])

    expect(collection.doesntContain({ name: 'Jane Doe', age: 24 })).toBe(false)
    expect(collection.doesntContain({ name: 'Jane Doe', age: 25 })).toBe(true)
    expect(collection.doesntContain({ name: 'John Doe', age: 27 })).toBe(false)
  })
})
