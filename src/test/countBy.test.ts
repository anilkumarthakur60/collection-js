import { collect } from '../collect'

describe('countBy', () => {
  it('The countBy method counts the occurrences of values returned by the iteratee function:', () => {
    const collection = collect([1, 2, 3, 2, 1, 1])
    const result = collection.countBy((item) => item)
    expect(result).toEqual({ '1': 3, '2': 2, '3': 1 })
  })

  it('The countBy method works with strings:', () => {
    const collection = collect(['apple', 'banana', 'apple', 'cherry', 'banana'])
    const result = collection.countBy((item) => item)
    expect(result).toEqual({ apple: 2, banana: 2, cherry: 1 })
  })

  it('The countBy method works with complex objects:', () => {
    const collection = collect([
      { type: 'fruit', name: 'apple' },
      { type: 'fruit', name: 'banana' },
      { type: 'vegetable', name: 'carrot' },
      { type: 'fruit', name: 'apple' }
    ])
    const result = collection.countBy((item) => item.type)
    expect(result).toEqual({ fruit: 3, vegetable: 1 })
  })

  it('The countBy method works with numbers and custom iteratee function:', () => {
    const collection = collect([1.1, 2.2, 3.3, 2.4, 1.5])
    const result = collection.countBy((item) => Math.floor(item))
    expect(result).toEqual({ '1': 2, '2': 2, '3': 1 })
  })

  it('The countBy method works with mixed data types:', () => {
    const collection = collect([1, '1', 2, '2', 2])
    const result = collection.countBy((item) => typeof item)
    expect(result).toEqual({ number: 3, string: 2 })
  })

  it('The countBy method works with empty collection:', () => {
    const collection = collect([])
    const result = collection.countBy((item) => item)
    expect(result).toEqual({})
  })

  it('The countBy method works with undefined values returned by the iteratee function:', () => {
    const collection = collect([1, 2, undefined, 2, 3, undefined])
    const result = collection.countBy((item) => (item === undefined ? 'undefined' : 'defined'))
    expect(result).toEqual({ defined: 4, undefined: 2 })
  })

  it('The countBy method works with nested properties in complex objects:', () => {
    const collection = collect([
      { info: { type: 'fruit' } },
      { info: { type: 'vegetable' } },
      { info: { type: 'fruit' } },
      { info: { type: 'fruit' } }
    ])
    const result = collection.countBy((item) => item.info.type)
    expect(result).toEqual({ fruit: 3, vegetable: 1 })
  })

  it('The countBy method works with boolean values returned by the iteratee function:', () => {
    const collection = collect([true, false, true, true, false])
    const result = collection.countBy((item) => item)
    expect(result).toEqual({ true: 3, false: 2 })
  })
})
