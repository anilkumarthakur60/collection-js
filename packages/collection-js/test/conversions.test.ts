import { collect, ItemNotFoundException } from '../src'

describe('Collection conversions (audit: toMap/toSet/toJSON/toString/valueOf/toPrimitive untested)', () => {
  const people = [
    { name: 'Alice', age: 35 },
    { name: 'Bob', age: 28 }
  ]

  it('toMap builds a Map from key/value extractors with indices', () => {
    const map = collect(people).toMap(
      (p, i) => `${i}:${p.name}`,
      (p) => p.age
    )
    expect(map).toBeInstanceOf(Map)
    expect([...map.entries()]).toEqual([
      ['0:Alice', 35],
      ['1:Bob', 28]
    ])
  })

  it('toSet dedupes into a native Set', () => {
    const set = collect([1, 2, 2, 3]).toSet()
    expect(set).toBeInstanceOf(Set)
    expect([...set]).toEqual([1, 2, 3])
  })

  it('toJSON returns a shallow copy usable by JSON.stringify', () => {
    const c = collect([1, 2])
    const arr = c.toJSON()
    expect(arr).toEqual([1, 2])
    arr.push(3)
    expect(c.all()).toEqual([1, 2])
    expect(JSON.stringify({ c })).toBe('{"c":[1,2]}')
  })

  it('toString serialises like toJson', () => {
    expect(collect([1, 'a']).toString()).toBe('[1,"a"]')
    expect(String(collect([]))).toBe('[]')
  })

  it('valueOf returns an independent shallow copy', () => {
    const c = collect([1, 2])
    const v = c.valueOf()
    expect(v).toEqual([1, 2])
    v.pop()
    expect(c.all()).toEqual([1, 2])
  })

  it('toPrettyJson honours the indent parameter', () => {
    expect(collect([1]).toPrettyJson()).toBe('[\n  1\n]')
    expect(collect([1]).toPrettyJson(4)).toBe('[\n    1\n]')
  })

  it('Symbol.toPrimitive: number hint is the length, string hint the JSON', () => {
    const c = collect([1, 2, 3])
    expect(Number(c)).toBe(3)
    expect(`${c}`).toBe('[1,2,3]')
    expect(c[Symbol.toPrimitive]('default')).toEqual([1, 2, 3])
  })

  it('Symbol.toStringTag identifies the class', () => {
    expect(Object.prototype.toString.call(collect([]))).toBe('[object Collection]')
  })
})

describe('Collection.clone (audit: clone + deepClone engine untested)', () => {
  it('deep-clones nested structures so mutations never leak back', () => {
    const source = collect([{ nested: { list: [1, 2] } }])
    const cloned = source.clone()

    const clonedFirst = cloned.first()
    expect(clonedFirst).toEqual(source.first())
    expect(clonedFirst).not.toBe(source.first())

    clonedFirst?.nested.list.push(99)
    expect(source.first()?.nested.list).toEqual([1, 2])
  })

  it('clones Date and RegExp members as equal but distinct instances', () => {
    const d = new Date('2024-05-06T07:08:09Z')
    const r = /ab+c/gi
    const source = collect([{ d, r }])
    const cloned = source.clone().first()

    expect(cloned?.d).not.toBe(d)
    expect(cloned?.d.getTime()).toBe(d.getTime())
    expect(cloned?.r).not.toBe(r)
    expect(cloned?.r.source).toBe(r.source)
    expect(cloned?.r.flags).toBe(r.flags)
  })

  it('collect() (instance) is a shallow copy: same item references, new container', () => {
    const item = { a: 1 }
    const source = collect([item])
    const copied = source.collect()
    expect(copied).not.toBe(source)
    expect(copied.first()).toBe(item)
  })

  it('wrap()/unwrap() instance helpers round-trip', () => {
    const c = collect([1, 2])
    expect(c.wrap().all()).toEqual([[1, 2]])
    expect(c.unwrap()).toEqual([1, 2])
    expect(collect([7]).unwrap()).toBe(7)
    expect(collect([]).unwrap()).toEqual([])
  })

  it('instance range() delegates to the static factory', () => {
    expect(collect([]).range(1, 3).all()).toEqual([1, 2, 3])
  })
})

describe('Collection.dump/dd (audit: debug helpers untested)', () => {
  it('dump logs the items and returns the collection for chaining', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    try {
      const c = collect([1, 2])
      expect(c.dump()).toBe(c)
      expect(spy).toHaveBeenCalledWith([1, 2])
    } finally {
      spy.mockRestore()
    }
  })

  it('dd logs then throws to halt execution', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    try {
      expect(() => collect([1]).dd()).toThrow(ItemNotFoundException)
      expect(spy).toHaveBeenCalledWith([1])
    } finally {
      spy.mockRestore()
    }
  })
})

describe('aggregation getter proxies: symbol access passes through (Collection.ts get trap)', () => {
  it('symbol property access on sum/avg proxies does not evaluate an aggregation', () => {
    const sum = collect([1, 2]).sum as unknown as Record<symbol, unknown>
    expect(sum[Symbol.toStringTag]).toBeUndefined()
    expect(typeof collect([1, 2]).sum).toBe('function')
  })
})
