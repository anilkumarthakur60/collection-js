import { collect } from '../collect'

describe('containsOneItem', () => {
  it('The containsOneItem method determines if the collection contains a single item:', () => {
    expect(collect([]).containsOneItem()).toBe(false)
    expect(collect(['1']).containsOneItem()).toBe(true)
    expect(collect(['1', '2']).containsOneItem()).toBe(false)
  })

  it('The containsOneItem method works with a predicate function:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.containsOneItem((item) => item === 3)).toBe(true)
    expect(collection.containsOneItem((item) => item > 3)).toBe(false)
    expect(collection.containsOneItem((item) => item < 3)).toBe(false)
  })

  it('The containsOneItem method works with complex objects:', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(collection.containsOneItem((item) => item.id === 2)).toBe(true)
    expect(collection.containsOneItem((item) => item.id > 1)).toBe(false)
  })
})
