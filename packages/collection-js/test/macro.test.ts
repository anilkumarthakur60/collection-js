import { collect, lazy, Collection, LazyCollection, applyMacroable } from '../src'

afterEach(() => {
  Collection.flushMacros()
  LazyCollection.flushMacros()
})

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

  it('macro receives typed arguments without casts (regression: registration was untyped)', () => {
    Collection.macro('multiplyAll', function (this: Collection<number>, factor: number) {
      return this.map((v) => v * factor)
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

describe('Macroable registry (regression: hasMacro/getMacro/flushMacros and isolation untested)', () => {
  it('hasMacro reflects registration state', () => {
    expect(Collection.hasMacro('shout')).toBe(false)
    Collection.macro('shout', function (this: Collection<string>) {
      return this.map((v) => `${v}!`)
    })
    expect(Collection.hasMacro('shout')).toBe(true)
  })

  it('getMacro returns the registered function, undefined for unknown names', () => {
    const fn = function (this: Collection<number>) {
      return this.count()
    }
    Collection.macro('sizeOf', fn)
    expect(typeof Collection.getMacro('sizeOf')).toBe('function')
    expect(Collection.getMacro('nope')).toBeUndefined()
  })

  it('flushMacros removes both the registry entry and the prototype method', () => {
    Collection.macro('temp', function (this: Collection<number>) {
      return this.count()
    })
    const c = collect([1]) as unknown as { temp?: () => number }
    expect(c.temp?.()).toBe(1)
    Collection.flushMacros()
    expect(Collection.hasMacro('temp')).toBe(false)
    expect((collect([1]) as unknown as { temp?: () => number }).temp).toBeUndefined()
  })

  it('re-registering a name overwrites the previous macro', () => {
    Collection.macro('answer', function (this: Collection<unknown>) {
      return 1
    })
    Collection.macro('answer', function (this: Collection<unknown>) {
      return 42
    })
    expect((collect([]) as unknown as { answer(): number }).answer()).toBe(42)
  })

  it('Collection macros are invisible to LazyCollection and vice versa (per-class registries)', () => {
    Collection.macro('eagerOnly', function (this: Collection<unknown>) {
      return 'eager'
    })
    LazyCollection.macro('lazyOnly', function (this: LazyCollection<unknown>) {
      return 'lazy'
    })
    expect(Collection.hasMacro('eagerOnly')).toBe(true)
    expect(LazyCollection.hasMacro('eagerOnly')).toBe(false)
    expect(LazyCollection.hasMacro('lazyOnly')).toBe(true)
    expect(Collection.hasMacro('lazyOnly')).toBe(false)
    expect((lazy([]) as unknown as { lazyOnly(): string }).lazyOnly()).toBe('lazy')
  })

  it('subclasses inherit parent macros through the prototype-chain lookup', () => {
    class TypedCollection<T> extends Collection<T> {}
    applyMacroable(TypedCollection)

    Collection.macro('fromParent', function (this: Collection<unknown>) {
      return 'parent'
    })
    TypedCollection.macro('fromChild', function (this: Collection<unknown>) {
      return 'child'
    })

    // Lookup walks the prototype chain: the subclass sees the parent's macro…
    expect(TypedCollection.hasMacro('fromParent')).toBe(true)
    expect(typeof TypedCollection.getMacro('fromParent')).toBe('function')
    // …but the parent does not see the subclass's.
    expect(Collection.hasMacro('fromChild')).toBe(false)

    const sub = new TypedCollection([1]) as unknown as {
      fromParent(): string
      fromChild(): string
    }
    expect(sub.fromParent()).toBe('parent')
    expect(sub.fromChild()).toBe('child')

    TypedCollection.flushMacros()
  })

  it('registration is global across the class: instances created before the macro see it too', () => {
    const early = collect([1, 2]) as unknown as { late?: () => number }
    Collection.macro('late', function (this: Collection<number>) {
      return this.count()
    })
    expect(early.late?.()).toBe(2)
  })
})
