import { collect, Collection } from '../src'

describe('groupByMany (audit: groupByManyOf recursion untested)', () => {
  const users = [
    { role: 'admin', active: 'yes', name: 'Alice' },
    { role: 'admin', active: 'no', name: 'Bob' },
    { role: 'user', active: 'yes', name: 'Cara' },
    { role: 'admin', active: 'yes', name: 'Dan' }
  ]

  it('nests two grouping levels left-to-right', () => {
    const grouped = collect(users).groupByMany(['role', 'active']) as Record<
      string,
      Record<string, Array<{ name: string }>>
    >
    expect(Object.keys(grouped).sort()).toEqual(['admin', 'user'])
    expect(grouped['admin']['yes'].map((u) => u.name)).toEqual(['Alice', 'Dan'])
    expect(grouped['admin']['no'].map((u) => u.name)).toEqual(['Bob'])
    expect(grouped['user']['yes'].map((u) => u.name)).toEqual(['Cara'])
    expect(grouped['user']['no']).toBeUndefined()
  })

  it('supports callback groupers at any level', () => {
    const grouped = collect([1, 2, 3, 4, 5, 6]).groupByMany([
      (n) => (n % 2 === 0 ? 'even' : 'odd'),
      (n) => (n > 3 ? 'high' : 'low')
    ]) as Record<string, Record<string, number[]>>
    expect(grouped['even']['low']).toEqual([2])
    expect(grouped['even']['high']).toEqual([4, 6])
    expect(grouped['odd']['low']).toEqual([1, 3])
    expect(grouped['odd']['high']).toEqual([5])
  })

  it('a single grouper behaves like groupBy (flat record of arrays)', () => {
    const grouped = collect(users).groupByMany(['role']) as Record<string, unknown[]>
    expect(grouped['admin']).toHaveLength(3)
    expect(grouped['user']).toHaveLength(1)
  })

  it('three levels recurse fully', () => {
    const grouped = collect(users).groupByMany(['role', 'active', (u) => u.name.length]) as Record<
      string,
      Record<string, Record<string, unknown[]>>
    >
    expect(grouped['admin']['yes']['5']).toEqual([users[0]])
    expect(grouped['admin']['yes']['3']).toEqual([users[3]])
  })

  it('empty groupers pass the items through unchanged (documented passthrough)', () => {
    const result = collect(users).groupByMany([])
    expect(result).toEqual(users)
  })

  it('empty collection produces an empty record', () => {
    expect(collect<{ role: string }>([]).groupByMany(['role'])).toEqual({})
  })

  it('groupBy values remain chainable Collections while groupByMany leaves are arrays', () => {
    const flat = collect(users).groupBy('role')
    expect(flat['admin']).toBeInstanceOf(Collection)
    const nested = collect(users).groupByMany(['role']) as Record<string, unknown>
    expect(Array.isArray(nested['admin'])).toBe(true)
  })
})
