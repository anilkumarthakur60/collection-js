import { collect } from '../collect'

describe('contains', () => {
  it('returns true when value exists', () => {
    expect(collect([1, 2, 3]).contains(2)).toBe(true)
  })

  it('returns false when value does not exist', () => {
    expect(collect([1, 2, 3]).contains(99)).toBe(false)
  })

  it('works with string values', () => {
    expect(collect(['a', 'b', 'c']).contains('b')).toBe(true)
  })

  it('works with a predicate function', () => {
    expect(collect([1, 2, 3]).contains((v) => v > 2)).toBe(true)
  })

  it('predicate returns false when no match', () => {
    expect(collect([1, 2, 3]).contains((v) => v > 10)).toBe(false)
  })

  it('works with partial object match', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    expect(collect(items).contains({ id: 1 })).toBe(true)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).contains(1)).toBe(false)
  })
})

describe('containsStrict', () => {
  it('returns true with strict match', () => {
    expect(collect([1, 2, 3]).containsStrict(2)).toBe(true)
  })

  it('returns false when type does not match strictly', () => {
    expect(collect([1, 2, 3]).containsStrict('2' as unknown as number)).toBe(false)
  })

  it('returns false when value not in collection', () => {
    expect(collect([1, 2, 3]).containsStrict(99)).toBe(false)
  })
})

describe('containsOneItem', () => {
  it('returns true when collection has exactly one item', () => {
    expect(collect([1]).containsOneItem()).toBe(true)
  })

  it('returns false when collection has more than one item', () => {
    expect(collect([1, 2]).containsOneItem()).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).containsOneItem()).toBe(false)
  })

  it('works with a callback', () => {
    expect(collect([1, 2, 3]).containsOneItem((v) => v > 2)).toBe(true)
  })

  it('callback returns false when multiple items match', () => {
    expect(collect([1, 2, 3]).containsOneItem((v) => v > 1)).toBe(false)
  })
})

describe('doesntContain', () => {
  it('returns true when value is not in collection', () => {
    expect(collect([1, 2, 3]).doesntContain(99)).toBe(true)
  })

  it('returns false when value is in collection', () => {
    expect(collect([1, 2, 3]).doesntContain(2)).toBe(false)
  })

  it('works with a predicate', () => {
    expect(collect([1, 2, 3]).doesntContain((v) => v > 10)).toBe(true)
  })
})

describe('doesntContainStrict', () => {
  it('returns true when value is not strictly in collection', () => {
    expect(collect([1, 2, 3]).doesntContainStrict('1' as unknown as number)).toBe(true)
  })

  it('returns false when value is strictly in collection', () => {
    expect(collect([1, 2, 3]).doesntContainStrict(1)).toBe(false)
  })
})
