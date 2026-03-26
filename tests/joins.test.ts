import { collect } from '../src'

describe('joins', () => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ]
  const orders = [
    { uid: 1, prod: 'X' },
    { uid: 1, prod: 'Y' },
    { uid: 3, prod: 'Z' },
    { uid: 99, prod: 'orphan' },
  ]

  describe('joinOn (inner)', () => {
    it('returns matched pairs only', () => {
      const result = collect(users).joinOn(orders, 'id', 'uid', (u, o) => `${u.name}/${o.prod}`)
      expect(result.all()).toEqual(['Alice/X', 'Alice/Y', 'Carol/Z'])
    })

    it('returns tuples by default when no merge fn supplied', () => {
      const result = collect(users).joinOn(orders, 'id', 'uid')
      expect(result.count()).toBe(3)
      expect(result.first()).toEqual([users[0], orders[0]])
    })

    it('returns empty when nothing matches', () => {
      const result = collect(users).joinOn([], 'id', 'uid')
      expect(result.all()).toEqual([])
    })
  })

  describe('leftJoin', () => {
    it('returns each left row at least once with undefined right when unmatched', () => {
      const result = collect(users).leftJoin(orders, 'id', 'uid', (u, o) => ({
        name: u.name,
        prod: o?.prod ?? null,
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Bob', prod: null },
        { name: 'Carol', prod: 'Z' },
      ])
    })
  })

  describe('rightJoin', () => {
    it('returns each right row at least once with undefined left when unmatched', () => {
      const result = collect(users).rightJoin(orders, 'id', 'uid', (u, o) => ({
        name: u?.name ?? null,
        prod: o.prod,
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Carol', prod: 'Z' },
        { name: null, prod: 'orphan' },
      ])
    })
  })

  describe('outerJoin', () => {
    it('includes both left-only and right-only rows', () => {
      const result = collect(users).outerJoin(orders, 'id', 'uid', (u, o) => ({
        name: u?.name ?? '-',
        prod: o?.prod ?? '-',
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Bob', prod: '-' },
        { name: 'Carol', prod: 'Z' },
        { name: '-', prod: 'orphan' },
      ])
    })
  })
})
