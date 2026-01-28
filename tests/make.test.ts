import { Collection } from '../src'

describe('Collection.make (static)', () => {
  it('creates a Collection from an array', () => {
    expect(Collection.make([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('creates an empty Collection when no args', () => {
    expect(Collection.make().all()).toEqual([])
  })

  it('returns a Collection instance', () => {
    expect(Collection.make([1, 2])).toBeInstanceOf(Collection)
  })

  it('works with strings', () => {
    expect(Collection.make(['a', 'b', 'c']).all()).toEqual(['a', 'b', 'c'])
  })

  it('works with objects', () => {
    expect(Collection.make([{ id: 1 }, { id: 2 }]).all()).toEqual([{ id: 1 }, { id: 2 }])
  })
})

describe('Collection.times (static)', () => {
  it('creates a Collection by invoking the factory n times', () => {
    expect(Collection.times(5, (i) => i * 2).all()).toEqual([2, 4, 6, 8, 10])
  })
})

describe('Collection.range (static)', () => {
  it('creates a numeric range', () => {
    expect(Collection.range(1, 5).all()).toEqual([1, 2, 3, 4, 5])
  })
})
