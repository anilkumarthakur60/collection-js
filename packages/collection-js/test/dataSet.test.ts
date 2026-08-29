import { dataSet } from '../src'

describe('dataSet', () => {
  it('sets a nested value via dot path, creating intermediate objects', () => {
    const target: Record<string, unknown> = {}
    expect(dataSet(target, 'a.b.c', 1)).toBe(target)
    expect(target).toEqual({ a: { b: { c: 1 } } })
  })

  it('reuses existing own object containers', () => {
    const target: Record<string, unknown> = { a: { x: 1 } }
    dataSet(target, 'a.y', 2)
    expect(target).toEqual({ a: { x: 1, y: 2 } })
  })

  describe('prototype pollution guard (regression: __proto__ paths reached Object.prototype)', () => {
    it('rejects __proto__ segments and leaves the target unchanged', () => {
      const target: Record<string, unknown> = {}
      dataSet(target, '__proto__.polluted', 'boom')
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined()
      expect(Object.prototype).not.toHaveProperty('polluted')
      expect(target).toEqual({})
    })

    it('rejects constructor and prototype segments anywhere in the path', () => {
      const target: Record<string, unknown> = {}
      dataSet(target, 'constructor.prototype.polluted', 'boom')
      dataSet(target, 'a.prototype.b', 'boom')
      dataSet(target, 'a.constructor', 'boom')
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined()
      expect(Object.prototype).not.toHaveProperty('polluted')
      expect(target).toEqual({})
    })

    it('never descends into inherited members  it shadows them with own containers', () => {
      const proto = { nested: {} as Record<string, unknown> }
      const target = Object.create(proto) as Record<string, unknown>
      dataSet(target, 'nested.x', 1)
      expect(proto.nested).toEqual({})
      expect(Object.prototype.hasOwnProperty.call(target, 'nested')).toBe(true)
      expect((target['nested'] as Record<string, unknown>)['x']).toBe(1)
    })
  })
})
