import { collect } from '../src'

describe('joins', () => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' }
  ]
  const orders = [
    { uid: 1, prod: 'X' },
    { uid: 1, prod: 'Y' },
    { uid: 3, prod: 'Z' },
    { uid: 99, prod: 'orphan' }
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

  describe('tuple forms without a merge callback (audit: only one arm per join tested)', () => {
    it('leftJoin emits [left, undefined] for unmatched rows', () => {
      const result = collect(users).leftJoin(orders, 'id', 'uid')
      expect(result.all()).toEqual([
        [users[0], orders[0]],
        [users[0], orders[1]],
        [users[1], undefined],
        [users[2], orders[2]]
      ])
    })

    it('rightJoin emits [undefined, right] for unmatched rows', () => {
      const result = collect(users).rightJoin(orders, 'id', 'uid')
      expect(result.all()).toEqual([
        [users[0], orders[0]],
        [users[0], orders[1]],
        [users[2], orders[2]],
        [undefined, orders[3]]
      ])
    })

    it('outerJoin emits both unmatched sides as partial tuples', () => {
      const result = collect(users).outerJoin(orders, 'id', 'uid')
      expect(result.all()).toEqual([
        [users[0], orders[0]],
        [users[0], orders[1]],
        [users[1], undefined],
        [users[2], orders[2]],
        [undefined, orders[3]]
      ])
    })

    it('outerJoin with a merge callback receives undefined for the missing side', () => {
      const merged = collect(users).outerJoin(orders, 'id', 'uid', (u, o) => [u?.name, o?.prod])
      expect(merged.all()).toContainEqual(['Bob', undefined])
      expect(merged.all()).toContainEqual([undefined, 'orphan'])
    })

    it('joins accept callback key retrievers and Collection right-hand sides', () => {
      const result = collect(users).joinOn(
        collect(orders),
        (u) => u.id,
        (o) => o.uid
      )
      expect(result.count()).toBe(3)
    })
  })

  describe('leftJoin', () => {
    it('returns each left row at least once with undefined right when unmatched', () => {
      const result = collect(users).leftJoin(orders, 'id', 'uid', (u, o) => ({
        name: u.name,
        prod: o?.prod ?? null
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Bob', prod: null },
        { name: 'Carol', prod: 'Z' }
      ])
    })
  })

  describe('rightJoin', () => {
    it('returns each right row at least once with undefined left when unmatched', () => {
      const result = collect(users).rightJoin(orders, 'id', 'uid', (u, o) => ({
        name: u?.name ?? null,
        prod: o.prod
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Carol', prod: 'Z' },
        { name: null, prod: 'orphan' }
      ])
    })
  })

  describe('outerJoin', () => {
    it('includes both left-only and right-only rows', () => {
      const result = collect(users).outerJoin(orders, 'id', 'uid', (u, o) => ({
        name: u?.name ?? '-',
        prod: o?.prod ?? '-'
      }))
      expect(result.all()).toEqual([
        { name: 'Alice', prod: 'X' },
        { name: 'Alice', prod: 'Y' },
        { name: 'Bob', prod: '-' },
        { name: 'Carol', prod: 'Z' },
        { name: '-', prod: 'orphan' }
      ])
    })
  })
})
