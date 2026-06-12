import * as api from '../src'
import { collect, lazy, Collection, LazyCollection } from '../src'

describe('public API surface (src/index barrel)', () => {
  it('collect() with no arguments returns an empty Collection', () => {
    const c = collect()
    expect(c).toBeInstanceOf(Collection)
    expect(c.all()).toEqual([])
  })

  it('lazy() with no arguments returns an empty LazyCollection', () => {
    const l = lazy()
    expect(l).toBeInstanceOf(LazyCollection)
    expect(l.all()).toEqual([])
  })

  it('default export is the collect helper', () => {
    expect(api.default).toBe(collect)
  })

  it('exposes the documented value exports (guards against dropped exports)', () => {
    const expected = [
      'collect',
      'lazy',
      'Collection',
      'LazyCollection',
      'AsyncCollection',
      'mapWithConcurrency',
      'parseCsv',
      'toCsv',
      'parseJsonl',
      'toJsonl',
      'parseJsonlStream',
      'fromReadable',
      'lines',
      'createHigherOrderProxy',
      'wireHigherOrderMessages',
      'HIGHER_ORDER_TARGETS',
      'registerMacro',
      'hasMacro',
      'getMacro',
      'flushMacros',
      'applyMacroable',
      'isArrayable',
      'CollectionException',
      'ItemNotFoundException',
      'MultipleItemsFoundException',
      'UnexpectedValueException',
      'operations',
      'dataGet',
      'dataSet',
      'deepEqual',
      'looseEqual',
      'deepClone',
      'valueRetriever',
      'operatorForWhere',
      'isOperator',
      'isPlainObject',
      'isObjectLike',
      'isFunction'
    ]
    const actual = Object.keys(api)
    for (const name of expected) {
      expect(actual, `missing export: ${name}`).toContain(name)
    }
  })

  it('HIGHER_ORDER_TARGETS lists the 25 Laravel proxy methods', () => {
    expect(api.HIGHER_ORDER_TARGETS).toHaveLength(25)
    expect(api.HIGHER_ORDER_TARGETS).toContain('each')
    expect(api.HIGHER_ORDER_TARGETS).toContain('sum')
  })
})
