import {
  collect,
  CollectionException,
  ItemNotFoundException,
  MultipleItemsFoundException,
  UnexpectedValueException
} from '../src'

describe('exception classes (audit: defaults, counts, and instanceof chains untested)', () => {
  it('CollectionException carries name, message, and Error lineage', () => {
    const e = new CollectionException('boom')
    expect(e.name).toBe('CollectionException')
    expect(e.message).toBe('boom')
    expect(e).toBeInstanceOf(Error)
    expect(e).toBeInstanceOf(CollectionException)
  })

  it('ItemNotFoundException defaults its message and chains instanceof', () => {
    const e = new ItemNotFoundException()
    expect(e.name).toBe('ItemNotFoundException')
    expect(e.message).toBe('Item not found.')
    expect(e).toBeInstanceOf(CollectionException)
    expect(new ItemNotFoundException('custom').message).toBe('custom')
  })

  it('MultipleItemsFoundException exposes the count and a derived message', () => {
    const e = new MultipleItemsFoundException(3)
    expect(e.name).toBe('MultipleItemsFoundException')
    expect(e.count).toBe(3)
    expect(e.message).toBe('3 items were found.')
    expect(e).toBeInstanceOf(CollectionException)

    const defaulted = new MultipleItemsFoundException()
    expect(defaulted.count).toBe(0)
    expect(defaulted.message).toBe('0 items were found.')

    const custom = new MultipleItemsFoundException(2, 'too many')
    expect(custom.count).toBe(2)
    expect(custom.message).toBe('too many')
  })

  it('UnexpectedValueException defaults its message', () => {
    const e = new UnexpectedValueException()
    expect(e.name).toBe('UnexpectedValueException')
    expect(e.message).toBe('Unexpected value encountered.')
    expect(e).toBeInstanceOf(CollectionException)
    expect(new UnexpectedValueException('bad').message).toBe('bad')
  })
})

describe('throwing paths pin their exception types (audit: sole() asserted bare .toThrow())', () => {
  it('sole() on an empty collection throws ItemNotFoundException', () => {
    expect(() => collect([]).sole()).toThrow(ItemNotFoundException)
  })

  it('sole() with multiple matches throws MultipleItemsFoundException with the count', () => {
    let caught: unknown
    try {
      collect([1, 2]).sole()
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(MultipleItemsFoundException)
    expect(caught).toBeInstanceOf(CollectionException)
    expect((caught as MultipleItemsFoundException).count).toBe(2)
  })

  it('firstOrFail throws ItemNotFoundException', () => {
    expect(() => collect<number>([]).firstOrFail()).toThrow(ItemNotFoundException)
  })

  it('ensure throws UnexpectedValueException naming the offending type', () => {
    expect(() => collect<unknown>([1, 'x']).ensure('number')).toThrow(UnexpectedValueException)
    expect(() => collect<unknown>([1, 'x']).ensure('number')).toThrow(
      'Collection should only include "number" items, but string found.'
    )
  })

  it('random(n) larger than the collection throws CollectionException', () => {
    expect(() => collect([1]).random(5)).toThrow(CollectionException)
    expect(() => collect([1]).random(5)).toThrow(
      'You requested 5 items, but the collection only contains 1 items.'
    )
  })
})
