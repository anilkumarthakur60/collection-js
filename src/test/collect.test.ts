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
