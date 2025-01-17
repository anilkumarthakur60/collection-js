import { collect } from '../collect'

describe('dump', () => {
  it("The dump method dumps the collection's items:", () => {
    const collection = collect([1, 2, 3, 4, 5])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual([1, 2, 3, 4, 5])
    expect(consoleSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5])
    consoleSpy.mockRestore()
  })

  it('The dump method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual(['apple', 'banana', 'cherry'])
    expect(consoleSpy).toHaveBeenCalledWith(['apple', 'banana', 'cherry'])
    consoleSpy.mockRestore()
  })

  it('The dump method works with objects:', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(consoleSpy).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }, { id: 3 }])
    consoleSpy.mockRestore()
  })

  it('The dump method works with mixed data types:', () => {
    const collection = collect([1, 'apple', true])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual([1, 'apple', true])
    expect(consoleSpy).toHaveBeenCalledWith([1, 'apple', true])
    consoleSpy.mockRestore()
  })

  it('The dump method works with nested objects:', () => {
    const collection = collect([{ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual([{ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }])
    expect(consoleSpy).toHaveBeenCalledWith([{ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }])
    consoleSpy.mockRestore()
  })

  it('The dump method returns an empty array if the collection is empty:', () => {
    const collection = collect([])
    const consoleSpy = jest.spyOn(console, 'log')
    expect(collection.dump()).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith([])
    consoleSpy.mockRestore()
  })
})
