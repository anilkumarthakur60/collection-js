import { collect } from '../src/collect'

describe('dot', () => {
  it('flattens nested objects to dot notation', () => {
    const result = collect([{ name: { first: 'John', last: 'Doe' } }]).dot()
    expect(result).toEqual({ 'name.first': 'John', 'name.last': 'Doe' })
  })

  it('handles already flat object', () => {
    const result = collect([{ a: 1, b: 2 }]).dot()
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('handles deeply nested object', () => {
    const result = collect([{ a: { b: { c: 42 } } }]).dot()
    expect(result).toEqual({ 'a.b.c': 42 })
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).dot()).toEqual({})
  })

  it('merges multiple objects', () => {
    const result = collect([{ a: 1 }, { b: 2 }]).dot()
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('does not flatten arrays', () => {
    const result = collect([{ items: [1, 2, 3] }]).dot()
    expect(result).toEqual({ items: [1, 2, 3] })
  })
})

describe('undot', () => {
  it('expands dot notation keys to nested objects', () => {
    const result = collect([{ 'name.first': 'Marie', 'name.last': 'Valentine' }])
      .undot()
      .all()
    expect(result).toEqual([{ name: { first: 'Marie', last: 'Valentine' } }])
  })

  it('handles already expanded keys', () => {
    const result = collect([{ a: 1, b: 2 }])
      .undot()
      .all()
    expect(result).toEqual([{ a: 1, b: 2 }])
  })

  it('handles deeply nested dot keys', () => {
    const result = collect([{ 'a.b.c': 42 }])
      .undot()
      .all()
    expect(result).toEqual([{ a: { b: { c: 42 } } }])
  })

  it('returns collection with single empty object for empty input', () => {
    const result = collect([]).undot().all()
    expect(result).toEqual([{}])
  })

  it('merges multiple objects with dot keys', () => {
    const result = collect([{ 'x.y': 1 }, { 'x.z': 2 }])
      .undot()
      .all()
    expect(result).toEqual([{ x: { y: 1, z: 2 } }])
  })
})
