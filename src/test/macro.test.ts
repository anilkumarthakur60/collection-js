import { collect, Collection } from '../collect'

describe('Collection.macro', () => {
  it('adds a custom method to the collection', () => {
    Collection.macro('toUpper', function (this: Collection<string>) {
      return this.map((v) => v.toUpperCase())
    })
    const c = collect(['hello', 'world']) as unknown as Collection<string> & {
      toUpper(): Collection<string>
    }
    expect(c.toUpper().all()).toEqual(['HELLO', 'WORLD'])
  })

  it('macro receives arguments', () => {
    Collection.macro('multiplyAll', function (this: Collection<number>, factor: unknown) {
      return this.map((v) => v * (factor as number))
    })
    const c = collect([1, 2, 3]) as unknown as Collection<number> & {
      multiplyAll(f: number): Collection<number>
    }
    expect(c.multiplyAll(3).all()).toEqual([3, 6, 9])
  })

  it('macro is available on all instances', () => {
    Collection.macro('doubleAll', function (this: Collection<number>) {
      return this.map((v) => v * 2)
    })
    const c1 = collect([1, 2]) as unknown as { doubleAll(): Collection<number> }
    const c2 = collect([3, 4]) as unknown as { doubleAll(): Collection<number> }
    expect(c1.doubleAll().all()).toEqual([2, 4])
    expect(c2.doubleAll().all()).toEqual([6, 8])
  })

  it('macro can access collection properties', () => {
    Collection.macro('sumAll', function (this: Collection<number>) {
      return this.sum()
    })
    const c = collect([1, 2, 3, 4]) as unknown as { sumAll(): number }
    expect(c.sumAll()).toBe(10)
  })

  it('macro can return non-collection values', () => {
    Collection.macro('itemCount', function (this: Collection<unknown>) {
      return this.count()
    })
    const c = collect([1, 2, 3, 4, 5]) as unknown as { itemCount(): number }
    expect(c.itemCount()).toBe(5)
  })
})
