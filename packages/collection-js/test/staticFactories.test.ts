import { collect, Collection } from '../src'

describe('Collection static factories (audit: wrap/unwrap/empty/fromEntries/fromMap/fromSet untested)', () => {
  describe('wrap', () => {
    it('copies an existing Collection into a new instance', () => {
      const original = collect([1, 2])
      const wrapped = Collection.wrap(original)
      expect(wrapped).not.toBe(original)
      expect(wrapped.all()).toEqual([1, 2])
      // Independent copy: mutating the wrap does not touch the source.
      wrapped.push(3)
      expect(original.all()).toEqual([1, 2])
    })

    it('wraps null/undefined as an empty collection', () => {
      expect(Collection.wrap<number>(null).all()).toEqual([])
      expect(Collection.wrap<number>(undefined).all()).toEqual([])
    })

    it('wraps a scalar into a single-item collection', () => {
      expect(Collection.wrap(5).all()).toEqual([5])
    })

    it('keeps an array as-is', () => {
      expect(Collection.wrap([1, 2]).all()).toEqual([1, 2])
    })
  })

  describe('unwrap', () => {
    it('extracts the array from a Collection', () => {
      expect(Collection.unwrap(collect([1, 2]))).toEqual([1, 2])
    })

    it('passes through non-collection values', () => {
      expect(Collection.unwrap([3, 4])).toEqual([3, 4])
      expect(Collection.unwrap(7)).toBe(7)
    })
  })

  describe('empty', () => {
    it('returns a fresh empty collection each call', () => {
      const a = Collection.empty<number>()
      const b = Collection.empty<number>()
      expect(a.all()).toEqual([])
      expect(a).not.toBe(b)
    })
  })

  describe('fromEntries', () => {
    it('builds a single-object collection from entries', () => {
      const c = Collection.fromEntries([
        ['a', 1],
        ['b', 2]
      ])
      expect(c.all()).toEqual([{ a: 1, b: 2 }])
    })

    it('accepts a Map as the entries iterable', () => {
      const c = Collection.fromEntries(new Map([['k', 'v']]))
      expect(c.all()).toEqual([{ k: 'v' }])
    })
  })

  describe('fromMap', () => {
    it('turns a Map into a collection of [key, value] tuples', () => {
      const c = Collection.fromMap(
        new Map<string, number>([
          ['a', 1],
          ['b', 2]
        ])
      )
      expect(c.all()).toEqual([
        ['a', 1],
        ['b', 2]
      ])
    })

    it('empty Map produces an empty collection', () => {
      expect(Collection.fromMap(new Map()).all()).toEqual([])
    })
  })

  describe('fromSet', () => {
    it('turns a Set into a collection preserving insertion order', () => {
      expect(Collection.fromSet(new Set([3, 1, 3, 2])).all()).toEqual([3, 1, 2])
    })
  })

  describe('constructor accepts non-array iterables (audit: toArray branches untested)', () => {
    it('accepts a Set', () => {
      expect(new Collection(new Set(['x', 'y'])).all()).toEqual(['x', 'y'])
    })

    it('accepts a generator', () => {
      function* gen(): Generator<number> {
        yield 1
        yield 2
      }
      expect(new Collection(gen()).all()).toEqual([1, 2])
    })

    it('accepts an ArrayLike object', () => {
      const arrayLike: ArrayLike<string> = { length: 2, 0: 'a', 1: 'b' }
      expect(new Collection(arrayLike).all()).toEqual(['a', 'b'])
    })
  })
})
