import { collect } from '../collect'

describe('dot', () => {
  it('The dot method flattens a multi-dimensional collection into a single level collection that uses "dot" notation to indicate depth:', () => {
    const collection = collect([{ a: { b: { c: 1 } } }])
    expect(collection.dot()).toEqual({ 'a.b.c': 1 })
  })

  it('The dot method works with nested objects:', () => {
    const collection = collect([{ a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 }])
    expect(collection.dot()).toEqual({ 'a.b.c': 1, 'a.b.d': 2, 'a.e': 3, f: 4 })
  })

  it('The dot method handles multiple items in the collection:', () => {
    const collection = collect([{ a: { b: 1 } }, { c: { d: 2 } }])
    expect(collection.dot()).toEqual({ 'a.b': 1, 'c.d': 2 })
  })

  it('The dot method works with arrays inside objects:', () => {
    const collection = collect([{ a: { b: [1, 2, 3] } }])
    expect(collection.dot()).toEqual({ 'a.b': [1, 2, 3] })
  })

  it('The dot method works with mixed data types:', () => {
    const collection = collect([{ a: { b: 'string' }, c: 10, d: true }])
    expect(collection.dot()).toEqual({ 'a.b': 'string', c: 10, d: true })
  })

  it('The dot method returns an empty object if the collection is empty:', () => {
    const collection = collect([])
    expect(collection.dot()).toEqual({})
  })
})
