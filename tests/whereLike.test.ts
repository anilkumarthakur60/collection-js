import { collect, lazy } from '../src'

const users = [
  { name: 'Alice Smith', email: 'alice@example.com' },
  { name: 'Bob Jones', email: 'bob@test.org' },
  { name: 'Charlie Smith', email: 'charlie@example.com' }
]

describe('whereLike', () => {
  it('matches with a trailing % wildcard', () => {
    expect(collect(users).whereLike('name', 'Alice%').pluck('name').all()).toEqual(['Alice Smith'])
  })

  it('matches with a leading % wildcard', () => {
    expect(collect(users).whereLike('name', '%Smith').pluck('name').all()).toEqual([
      'Alice Smith',
      'Charlie Smith'
    ])
  })

  it('matches substrings when wrapped in %', () => {
    expect(collect(users).whereLike('email', '%example%').pluck('name').all()).toEqual([
      'Alice Smith',
      'Charlie Smith'
    ])
  })

  it('treats _ as a single-character wildcard', () => {
    expect(collect([{ code: 'A1' }, { code: 'A12' }, { code: 'B1' }]).whereLike('code', 'A_').pluck('code').all()).toEqual(['A1'])
  })

  it('is case-insensitive by default', () => {
    expect(collect(users).whereLike('name', 'alice%').pluck('name').all()).toEqual(['Alice Smith'])
  })

  it('honours caseSensitive=true', () => {
    expect(collect(users).whereLike('name', 'alice%', true).all()).toEqual([])
  })

  it('escapes regex metacharacters in the pattern', () => {
    const rows = [{ v: 'a.b' }, { v: 'axb' }]
    expect(collect(rows).whereLike('v', 'a.b').pluck('v').all()).toEqual(['a.b'])
  })

  it('does not match null/undefined values', () => {
    expect(collect([{ name: null }, { name: 'x' }]).whereLike('name', '%').pluck('name').all()).toEqual(['x'])
  })

  it('works on a LazyCollection', () => {
    expect(lazy(users).whereLike('name', '%Smith').pluck('name').all()).toEqual([
      'Alice Smith',
      'Charlie Smith'
    ])
  })
})

describe('whereNotLike', () => {
  it('returns the complement of whereLike', () => {
    expect(collect(users).whereNotLike('name', '%Smith').pluck('name').all()).toEqual(['Bob Jones'])
  })

  it('works on a LazyCollection', () => {
    expect(lazy(users).whereNotLike('email', '%example%').pluck('name').all()).toEqual(['Bob Jones'])
  })
})
