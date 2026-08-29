import { collect, lazy, Collection } from '../src'

const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Cara', role: 'admin' }
]

describe('keyed-result contract (regression: dead-end plain objects, inconsistently wrapped)', () => {
  describe('groupBy/mapToGroups return plain records with chainable Collection values', () => {
    it('groupBy group values are Collections  Laravel-style chaining works', () => {
      const groups = collect(users).groupBy('role')
      expect(groups['admin']).toBeInstanceOf(Collection)
      expect(groups['admin'].count()).toBe(2)
      expect(groups['admin'].map((u) => u.name).all()).toEqual(['Alice', 'Cara'])
      expect(groups['user'].pluck('name').all()).toEqual(['Bob'])
    })

    it('the record itself is a plain object (keyed results are terminal)', () => {
      const groups = collect(users).groupBy('role')
      expect(groups).not.toBeInstanceOf(Collection)
      expect(Object.keys(groups).sort()).toEqual(['admin', 'user'])
    })

    it('mapToGroups group values are Collections', () => {
      const groups = collect([1, 2, 3, 4]).mapToGroups((v) => [v % 2 === 0 ? 'even' : 'odd', v])
      expect(groups['even']).toBeInstanceOf(Collection)
      expect(groups['even'].sum()).toBe(6)
      expect(groups['odd'].all()).toEqual([1, 3])
    })

    it('LazyCollection.groupBy and mapToGroups follow the same contract', () => {
      const groups = lazy(users).groupBy('role')
      expect(groups['admin']).toBeInstanceOf(Collection)
      expect(groups['admin'].count()).toBe(2)

      const mapped = lazy([1, 2, 3]).mapToGroups((v) => [v > 1 ? 'big' : 'small', v])
      expect(mapped['big']).toBeInstanceOf(Collection)
      expect(mapped['big'].all()).toEqual([2, 3])
    })
  })

  describe('single-valued keyed results stay plain records (documented terminal contract)', () => {
    it('keyBy returns a plain record of items', () => {
      const keyed = collect(users).keyBy('name')
      expect(keyed).not.toBeInstanceOf(Collection)
      expect(keyed['Bob'].role).toBe('user')
    })

    it('countBy returns a plain record of numbers', () => {
      const counts = collect(users).countBy((u) => u.role)
      expect(counts).toEqual({ admin: 2, user: 1 })
    })

    it('mapWithKeys returns a plain record', () => {
      expect(collect(users).mapWithKeys((u) => [u.name, u.role])).toEqual({
        Alice: 'admin',
        Bob: 'user',
        Cara: 'admin'
      })
    })

    it('combine returns a plain record', () => {
      expect(collect(['a', 'b']).combine([1, 2])).toEqual({ a: 1, b: 2 })
    })

    it('duplicates returns a plain record keyed by original index', () => {
      expect(collect(['x', 'y', 'x']).duplicates()).toEqual({ 2: 'x' })
    })

    it('pluck(value, key) returns a plain record', () => {
      expect(collect(users).pluck('role', 'name')).toEqual({
        Alice: 'admin',
        Bob: 'user',
        Cara: 'admin'
      })
    })
  })
})
