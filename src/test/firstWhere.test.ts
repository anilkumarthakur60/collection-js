import { collect } from '../collect'

describe('firstWhere', () => {
  it('should return the first item with the given key/value pair', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const firstItem = collection.firstWhere('id', 2)

    expect(firstItem).toEqual({ id: 2 })
  })

  it('should return null if no item matches the given key/value pair', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const firstItem = collection.firstWhere('id', 4)

    expect(firstItem).toBeNull()
  })

  it('should return the first item where the given key\'s value is "truthy" when only key is provided', () => {
    const collection = collect([{ active: false }, { active: true }, { active: true }])
    const firstItem = collection.firstWhere('active')

    expect(firstItem).toEqual({ active: true })
  })

  it('should return null if no item has a "truthy" value for the given key', () => {
    const collection = collect([{ active: false }, { active: false }])
    const firstItem = collection.firstWhere('active')

    expect(firstItem).toBeNull()
  })

  it('should return the first item that matches the given key/value pair with a comparison operator', () => {
    const collection = collect([{ age: 20 }, { age: 25 }, { age: 30 }])
    const firstItem = collection.firstWhere('age', 25, '>')

    expect(firstItem).toEqual({ age: 30 })
  })

  it('should return null if no item matches the given key/value pair with a comparison operator', () => {
    const collection = collect([{ age: 20 }, { age: 25 }, { age: 30 }])
    const firstItem = collection.firstWhere('age', 35, '>')

    expect(firstItem).toBeNull()
  })
})
