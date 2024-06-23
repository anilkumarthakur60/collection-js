import { collect } from '../collect'

describe('after', () => {
  it('The after method returns the item after the given item. null is returned if the given item is not found or is the last item:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.after(3)).toBe(4)
    expect(collection.after(5)).toBe(null)
  })

  it('The after method supports loose comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after('4')).toBe(6)
  })

  it('The after method supports strict comparison:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after('4', true)).toBe(null)
  })

  it('The after method supports custom closure:', () => {
    const collection = collect([2, 4, 6, 8])
    expect(collection.after((item: number) => item > 5)).toBe(8)
  })
})
