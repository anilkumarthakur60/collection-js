import { collect } from '../collect'

describe('ensure', () => {
  it('does not throw when all items are of the expected primitive type', () => {
    expect(() => collect([1, 2, 3]).ensure('number')).not.toThrow()
  })

  it('does not throw for string type', () => {
    expect(() => collect(['a', 'b']).ensure('string')).not.toThrow()
  })

  it('throws UnexpectedValueException when item does not match type', () => {
    expect(() => collect([1, 'two', 3] as number[]).ensure('number')).toThrow()
  })

  it('throws when collection has mixed types and only one type expected', () => {
    expect(() => collect([1, 2, 'three'] as number[]).ensure('number')).toThrow()
  })

  it('does not throw for empty collection', () => {
    expect(() => collect([]).ensure('number')).not.toThrow()
  })

  it('throws for boolean when number expected', () => {
    expect(() => collect([true, false] as unknown as number[]).ensure('number')).toThrow()
  })

  it('works with class instances', () => {
    class Foo {}
    const items = [new Foo(), new Foo()]
    expect(() => collect(items).ensure(Foo)).not.toThrow()
  })

  it('throws when class instance does not match', () => {
    class Foo {}
    class Bar {}
    const items = [new Foo()] as unknown[]
    expect(() => collect(items as Bar[]).ensure(Bar)).toThrow()
  })

  it('returns the collection for chaining', () => {
    const c = collect([1, 2, 3])
    expect(c.ensure('number')).toBe(c)
  })

  it('does not throw when multiple types are accepted', () => {
    expect(() =>
      collect([1, 'two'] as unknown as number[]).ensure('number', 'string')
    ).not.toThrow()
  })
})
