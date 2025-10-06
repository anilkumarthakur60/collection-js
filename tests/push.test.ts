import { collect } from '../src/collect'

describe('push', () => {
  it('appends a value to the collection', () => {
    const c = collect([1, 2])
    c.push(3)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('appends multiple values', () => {
    const c = collect([1])
    c.push(2, 3, 4)
    expect(c.all()).toEqual([1, 2, 3, 4])
  })

  it('mutates the collection in place', () => {
    const c = collect([1, 2])
    const returned = c.push(3)
    expect(returned).toBe(c)
  })

  it('works on empty collection', () => {
    const c = collect<number>([])
    c.push(1)
    expect(c.all()).toEqual([1])
  })
})

describe('prepend', () => {
  it('adds a value at the beginning', () => {
    expect(collect([2, 3]).prepend(1).all()).toEqual([1, 2, 3])
  })

  it('works on empty collection', () => {
    expect(collect<number>([]).prepend(1).all()).toEqual([1])
  })

  it('does not mutate original', () => {
    const c = collect([2, 3])
    c.prepend(1)
    expect(c.all()).toEqual([2, 3])
  })
})

describe('pull', () => {
  it('removes a specific value from the collection', () => {
    expect(collect([1, 2, 3, 2]).pull(2).all()).toEqual([1, 3])
  })

  it('returns same collection when value not found', () => {
    expect(collect([1, 2, 3]).pull(99).all()).toEqual([1, 2, 3])
  })

  it('removes all occurrences', () => {
    expect(collect([1, 2, 1, 2]).pull(1).all()).toEqual([2, 2])
  })

  it('works on empty collection', () => {
    expect(collect([]).pull(1).all()).toEqual([])
  })
})

describe('put', () => {
  it('sets a key on all items to the given value', () => {
    const items = [
      { id: 1, active: false },
      { id: 2, active: false }
    ]
    const result = collect(items).put('active', true)
    expect(result.all()).toEqual([
      { id: 1, active: true },
      { id: 2, active: true }
    ])
  })

  it('does not mutate original collection', () => {
    const items = [{ id: 1, name: 'Alice' }]
    const c = collect(items)
    c.put('name', 'Bob')
    expect(c.all()[0].name).toBe('Alice')
  })
})
