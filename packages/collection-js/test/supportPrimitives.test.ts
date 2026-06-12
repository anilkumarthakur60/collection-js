import {
  collect,
  dataGet,
  dataSet,
  deepClone,
  deepEqual,
  looseEqual,
  isArrayable,
  isFunction,
  isPlainObject,
  isObjectLike,
  operatorForWhere,
  isOperator
} from '../src'
import type { Operator } from '../src/support/types'
import { toArray, arrayWrap, ensureArray } from '../src/support/arrayWrap'

describe('dataGet (audit: wildcard/index/default paths untested)', () => {
  const data = {
    users: [
      { name: 'Alice', pets: [{ kind: 'cat' }, { kind: 'dog' }] },
      { name: 'Bob', pets: [{ kind: 'fish' }] }
    ],
    items: ['a', 'b', 'c'],
    empty: null
  }

  it('resolves a * wildcard across an array', () => {
    expect(dataGet(data, 'users.*.name')).toEqual(['Alice', 'Bob'])
  })

  it('flattens nested wildcards', () => {
    expect(dataGet(data, 'users.*.pets.*.kind')).toEqual(['cat', 'dog', 'fish'])
  })

  it('a trailing * returns the entries themselves', () => {
    expect(dataGet({ list: [1, 2] }, 'list.*')).toEqual([1, 2])
  })

  it('* on a non-array returns the default', () => {
    expect(dataGet({ x: 5 }, 'x.*', 'fallback')).toBe('fallback')
  })

  it('numeric segments index into arrays', () => {
    expect(dataGet(data, 'items.1')).toBe('b')
    expect(dataGet(data, 'users.0.pets.1.kind')).toBe('dog')
  })

  it('out-of-range or negative indices return the default', () => {
    expect(dataGet(data, 'items.9', 'dflt')).toBe('dflt')
    expect(dataGet(data, 'items.-1', 'dflt')).toBe('dflt')
  })

  it('missing keys return the default', () => {
    expect(dataGet(data, 'nope', 'dflt')).toBe('dflt')
    expect(dataGet(data, 'users.0.salary', 'dflt')).toBe('dflt')
  })

  it('null targets and null intermediates return the default', () => {
    expect(dataGet(null, 'a.b', 'dflt')).toBe('dflt')
    expect(dataGet(data, 'empty.deep', 'dflt')).toBe('dflt')
  })

  it('accepts a pre-split array path', () => {
    expect(dataGet(data, ['users', '1', 'name'])).toBe('Bob')
  })

  it('round-trips with dataSet', () => {
    const target: Record<string, unknown> = {}
    dataSet(target, 'a.b.c', 42)
    expect(dataGet(target, 'a.b.c')).toBe(42)
  })
})

describe('deepClone (audit: 0% coverage on the clone engine)', () => {
  it('returns primitives unchanged', () => {
    expect(deepClone(5)).toBe(5)
    expect(deepClone('x')).toBe('x')
    expect(deepClone(null)).toBeNull()
    expect(deepClone(undefined)).toBeUndefined()
  })

  it('clones Dates as equal but distinct instances', () => {
    const d = new Date('2023-03-04')
    const c = deepClone(d)
    expect(c).not.toBe(d)
    expect(c.getTime()).toBe(d.getTime())
  })

  it('clones RegExps preserving source and flags', () => {
    const r = /a(b)+/gim
    const c = deepClone(r)
    expect(c).not.toBe(r)
    expect(c.source).toBe(r.source)
    expect(c.flags).toBe(r.flags)
  })

  it('deep-clones arrays of objects with full independence', () => {
    const src = [{ a: [1, { b: 2 }] }]
    const cloned = deepClone(src)
    expect(cloned).toEqual(src)
    expect(cloned[0]).not.toBe(src[0])
    expect(cloned[0].a).not.toBe(src[0].a)
    ;(cloned[0].a[1] as { b: number }).b = 99
    expect((src[0].a[1] as { b: number }).b).toBe(2)
  })

  it('passes class instances, Maps, and Sets through by reference (documented)', () => {
    class Thing {
      constructor(public v: number) {}
    }
    const t = new Thing(1)
    const m = new Map([['a', 1]])
    const s = new Set([1])
    expect(deepClone(t)).toBe(t)
    expect(deepClone(m)).toBe(m)
    expect(deepClone(s)).toBe(s)
  })
})

describe('deepEqual / looseEqual (audit: array recursion and Date/RegExp arms untested)', () => {
  it('compares arrays elementwise and recursively', () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true)
    expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it('array vs non-array object is never equal', () => {
    expect(deepEqual<unknown>([1], { 0: 1 })).toBe(false)
  })

  it('compares Dates by timestamp and rejects Date-vs-non-Date', () => {
    expect(deepEqual(new Date(1000), new Date(1000))).toBe(true)
    expect(deepEqual(new Date(1000), new Date(2000))).toBe(false)
    expect(deepEqual<unknown>(new Date(1000), { t: 1000 })).toBe(false)
  })

  it('compares RegExps by source+flags and rejects RegExp-vs-non-RegExp', () => {
    expect(deepEqual(/ab/g, /ab/g)).toBe(true)
    expect(deepEqual(/ab/g, /ab/i)).toBe(false)
    expect(deepEqual(/ab/g, /ac/g)).toBe(false)
    expect(deepEqual<unknown>(/ab/g, 'ab')).toBe(false)
  })

  it('rejects objects with mismatched key counts or missing keys', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(deepEqual<Record<string, number>>({ a: 1 }, { b: 1 })).toBe(false)
  })

  it('looseEqual emulates PHP ==: scalar coercion but not object-vs-scalar', () => {
    expect(looseEqual('1', 1)).toBe(true)
    expect(looseEqual(true, 1)).toBe(true)
    expect(looseEqual(null, undefined)).toBe(true)
    expect(looseEqual(null, 0)).toBe(false)
    expect(looseEqual({ a: 1 }, 1)).toBe(false)
    expect(looseEqual({ a: 1 }, { a: 1 })).toBe(true)
  })
})

describe('toArray / arrayWrap / ensureArray (audit: non-array constructor paths dead)', () => {
  it('toArray passes arrays through by reference', () => {
    const arr = [1, 2]
    expect(toArray(arr)).toBe(arr)
  })

  it('toArray unwraps Arrayable implementers', () => {
    const arrayable = { toArray: () => [1, 2] }
    expect(toArray<number>(arrayable as unknown as Iterable<number>)).toEqual([1, 2])
  })

  it('toArray consumes iterables (Set, Map, generators)', () => {
    expect(toArray(new Set(['a', 'b']))).toEqual(['a', 'b'])
    expect(toArray(new Map([['k', 1]]))).toEqual([['k', 1]])
    function* gen(): Generator<number> {
      yield 7
    }
    expect(toArray(gen())).toEqual([7])
  })

  it('toArray converts ArrayLike objects', () => {
    expect(toArray<string>({ length: 1, 0: 'z' })).toEqual(['z'])
  })

  it('toArray wraps single scalar values', () => {
    expect(toArray(5)).toEqual([5])
    expect(toArray('str')).toEqual(['str'])
  })

  it('arrayWrap maps null/undefined to [] and wraps scalars', () => {
    expect(arrayWrap(null)).toEqual([])
    expect(arrayWrap(undefined)).toEqual([])
    expect(arrayWrap(3)).toEqual([3])
    expect(arrayWrap([3])).toEqual([3])
  })

  it('ensureArray keeps arrays and materialises iterables', () => {
    const arr = [1]
    expect(ensureArray(arr)).toBe(arr)
    expect(ensureArray(new Set([2]))).toEqual([2])
  })

  it('isArrayable accepts toArray implementers and rejects everything else', () => {
    expect(isArrayable({ toArray: () => [] })).toBe(true)
    expect(isArrayable({})).toBe(false)
    expect(isArrayable(null)).toBe(false)
    expect(isArrayable('x')).toBe(false)
  })
})

describe('isObject helpers', () => {
  it('isPlainObject accepts plain/null-proto objects only', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(null)).toBe(false)
  })

  it('isObjectLike accepts any non-null object', () => {
    expect(isObjectLike([])).toBe(true)
    expect(isObjectLike(new Date())).toBe(true)
    expect(isObjectLike(null)).toBe(false)
    expect(isObjectLike(1)).toBe(false)
  })

  it('isFunction (audit: never executed)', () => {
    expect(isFunction(() => 1)).toBe(true)
    expect(isFunction(class {})).toBe(true)
    expect(isFunction({})).toBe(false)
  })
})

describe('operatorForWhere (audit: !=/<> and the default throw untested)', () => {
  it('!= and <> are loose inequality', () => {
    expect(operatorForWhere(1, '!=', '1')).toBe(false)
    expect(operatorForWhere(1, '!=', 2)).toBe(true)
    expect(operatorForWhere('a', '<>', 'b')).toBe(true)
    expect(operatorForWhere('a', '<>', 'a')).toBe(false)
  })

  it('throws on an unsupported operator smuggled past the type system', () => {
    expect(() => operatorForWhere(1, '~~' as unknown as Operator, 1)).toThrow(
      'Unsupported operator: ~~'
    )
  })

  it('isOperator recognises exactly the supported set', () => {
    for (const op of ['=', '==', '===', '!=', '!==', '<>', '<', '<=', '>', '>=']) {
      expect(isOperator(op)).toBe(true)
    }
    expect(isOperator('like')).toBe(false)
    expect(isOperator(5)).toBe(false)
  })
})

describe('valueRetriever dot-path and non-object branches (audit: dead lines 29/35)', () => {
  it('aggregations accept dot-path keys', () => {
    const rows = [{ user: { age: 2 } }, { user: { age: 3 } }]
    expect(collect(rows).sumBy('user.age')).toBe(5)
  })

  it('groupBy accepts dot-path keys', () => {
    const rows = [
      { user: { address: { city: 'Oslo' } } },
      { user: { address: { city: 'Rome' } } },
      { user: { address: { city: 'Oslo' } } }
    ]
    const grouped = collect(rows).groupBy('user.address.city')
    expect(grouped['Oslo'].count()).toBe(2)
    expect(grouped['Rome'].count()).toBe(1)
  })

  it('string keys on non-object items resolve to undefined', () => {
    expect(collect([1, 2]).countBy('x')).toEqual({ undefined: 2 })
  })
})
