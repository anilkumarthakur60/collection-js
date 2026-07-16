import { collect } from '../src'

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

  it('returns the collection itself for chaining', () => {
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
  it('adds a value at the beginning (mutating, Laravel parity)', () => {
    const c = collect([2, 3])
    c.prepend(1)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('works on empty collection', () => {
    const c = collect<number>([])
    c.prepend(1)
    expect(c.all()).toEqual([1])
  })

  it('returns the collection for chaining', () => {
    const c = collect([2, 3])
    expect(c.prepend(1)).toBe(c)
  })
})

describe('pull', () => {
  it('removes the first matching value and returns it', () => {
    const c = collect([1, 2, 3])
    expect(c.pull(2)).toBe(2)
    expect(c.all()).toEqual([1, 3])
  })

  it('returns undefined when value not found', () => {
    const c = collect([1, 2, 3])
    expect(c.pull(99)).toBeUndefined()
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('removes only the first occurrence', () => {
    const c = collect([1, 2, 1, 2])
    expect(c.pull(1)).toBe(1)
    expect(c.all()).toEqual([2, 1, 2])
  })

  it('works on empty collection', () => {
    expect(collect<number>([]).pull(1)).toBeUndefined()
  })
})

describe('put', () => {
  it('sets a key on every item', () => {
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

  it('mutates the collection in place and returns it, matching Laravel (regression: put contradicted its own doc)', () => {
    const c = collect([{ id: 1, name: 'Alice' }])
    const result = c.put('name', 'Bob')
    expect(c.all()).toEqual([{ id: 1, name: 'Bob' }])
    expect(result.all()).toEqual([{ id: 1, name: 'Bob' }])
  })

  it('does not mutate the original item objects', () => {
    const item = { id: 1, name: 'Alice' }
    collect([item]).put('name', 'Bob')
    expect(item.name).toBe('Alice')
  })

  it('can add a brand-new key, widening the element type (regression: put was typed to reject new keys)', () => {
    const result = collect([{ a: 1 }, { a: 2 }]).put('b', 'x')
    expect(result.all()).toEqual([
      { a: 1, b: 'x' },
      { a: 2, b: 'x' }
    ])
    // The widened type exposes the new key without casts.
    expect(result.first()?.b).toBe('x')
  })
})
