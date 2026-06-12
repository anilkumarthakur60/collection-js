import { collect, LazyCollection } from '../src'

describe('tapEach', () => {
  it('calls the callback for each item as they are pulled', () => {
    const tapped: number[] = []
    const result = collect([1, 2, 3])
      .lazy()
      .tapEach((v) => tapped.push(v))
      .all()
    expect(result).toEqual([1, 2, 3])
    expect(tapped).toEqual([1, 2, 3])
  })

  it('passes the index to the callback', () => {
    const indices: number[] = []
    const lazy = collect([10, 20, 30]).lazy()
    lazy.tapEach((_v, i) => indices.push(i)).all()
    expect(indices).toEqual([0, 1, 2])
  })

  it('does not call the callback until items are pulled', () => {
    const tapped: number[] = []
    const lazy = new LazyCollection([1, 2, 3]).tapEach((v) => tapped.push(v))
    // no iteration yet
    expect(tapped).toEqual([])
    // pull only first 2
    lazy.take(2).all()
    expect(tapped).toEqual([1, 2])
  })

  it('returns a LazyCollection', () => {
    const result = collect([1, 2])
      .lazy()
      .tapEach(() => undefined)
    expect(result).toBeInstanceOf(LazyCollection)
  })

  it('is chainable with other lazy methods', () => {
    const tapped: number[] = []
    const result = collect([1, 2, 3, 4])
      .lazy()
      .tapEach((v) => tapped.push(v))
      .filter((v) => v % 2 === 0)
      .all()
    expect(result).toEqual([2, 4])
    // callback fires for ALL items, not just filtered ones
    expect(tapped).toEqual([1, 2, 3, 4])
  })

  it('works on an empty collection', () => {
    const tapped: number[] = []
    const result = collect<number>([])
      .lazy()
      .tapEach((v) => tapped.push(v))
      .all()
    expect(result).toEqual([])
    expect(tapped).toEqual([])
  })
})

describe('tapEach on the eager Collection (audit: only the lazy variant was tested)', () => {
  it('invokes the callback immediately for every item and returns this', () => {
    const tapped: Array<[number, number]> = []
    const c = collect([5, 6])
    const returned = c.tapEach((v, i) => tapped.push([i, v]))
    expect(returned).toBe(c)
    expect(tapped).toEqual([
      [0, 5],
      [1, 6]
    ])
  })

  it('does not modify the collection', () => {
    const c = collect([1, 2])
    c.tapEach(() => undefined)
    expect(c.all()).toEqual([1, 2])
  })
})
