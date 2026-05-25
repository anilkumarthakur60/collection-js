import { collect } from '../src'

describe('isEmpty', () => {
  it('returns true for empty collection', () => {
    expect(collect([]).isEmpty()).toBe(true)
  })

  it('returns false for non-empty collection', () => {
    expect(collect([1]).isEmpty()).toBe(false)
  })

  it('returns false for collection with multiple items', () => {
    expect(collect([1, 2, 3]).isEmpty()).toBe(false)
  })

  it('returns false for collection with falsy values', () => {
    expect(collect([0, false, null] as unknown as number[]).isEmpty()).toBe(false)
  })
})

describe('isNotEmpty', () => {
  it('returns false for empty collection', () => {
    expect(collect([]).isNotEmpty()).toBe(false)
  })

  it('returns true for non-empty collection', () => {
    expect(collect([1]).isNotEmpty()).toBe(true)
  })

  it('returns true for collection with multiple items', () => {
    expect(collect([1, 2, 3]).isNotEmpty()).toBe(true)
  })

  it('returns true for collection with falsy values', () => {
    expect(collect([0, false] as unknown as number[]).isNotEmpty()).toBe(true)
  })

  it('isEmpty and isNotEmpty are inverse', () => {
    const c = collect([1, 2])
    expect(c.isEmpty()).toBe(!c.isNotEmpty())
  })
})
