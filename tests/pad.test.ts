import { collect } from '../src/collect'

describe('pad', () => {
  it('pads to the right when size is positive', () => {
    expect(collect(['A', 'B', 'C']).pad(5, '0').all()).toEqual(['A', 'B', 'C', '0', '0'])
  })

  it('pads to the left when size is negative', () => {
    expect(collect(['A', 'B', 'C']).pad(-5, '0').all()).toEqual(['0', '0', 'A', 'B', 'C'])
  })

  it('does not pad when size equals current length', () => {
    expect(collect([1, 2, 3]).pad(3, 0).all()).toEqual([1, 2, 3])
  })

  it('does not pad when size is less than current length', () => {
    expect(collect([1, 2, 3]).pad(2, 0).all()).toEqual([1, 2, 3])
  })

  it('pads empty collection to the right', () => {
    expect(collect([]).pad(3, 0).all()).toEqual([0, 0, 0])
  })

  it('pads empty collection to the left', () => {
    expect(collect([]).pad(-3, 'x').all()).toEqual(['x', 'x', 'x'])
  })

  it('pads with number value', () => {
    expect(collect([1]).pad(4, 0).all()).toEqual([1, 0, 0, 0])
  })

  it('pads with single item on left', () => {
    expect(collect([1]).pad(-3, 0).all()).toEqual([0, 0, 1])
  })
})
