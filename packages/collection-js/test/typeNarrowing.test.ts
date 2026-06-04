import { collect } from '../src'

/**
 * These tests verify behavior; the *real* value of these methods is the
 * compile-time narrowing they provide. The accompanying `// $ExpectType`
 * comments document the intent for future readers.
 */

describe('filter with type guard narrows result element type', () => {
  it('filters mixed-type arrays', () => {
    const mixed: (string | number)[] = [1, 'two', 3, 'four']
    // $ExpectType Collection<string>
    const strings = mixed.length > 0 ? collect(mixed).filter((v): v is string => typeof v === 'string') : null
    expect(strings?.all()).toEqual(['two', 'four'])
  })
})

describe('reject with type guard excludes the narrowed type', () => {
  it('removes nulls', () => {
    const items: (string | null)[] = ['a', null, 'b', null]
    // $ExpectType Collection<string>
    const noNulls = collect(items).reject((v): v is null => v === null)
    expect(noNulls.all()).toEqual(['a', 'b'])
  })
})

describe('partition with type guard splits into narrowed halves', () => {
  it('separates strings from numbers', () => {
    const mixed: (string | number)[] = [1, 'a', 2, 'b']
    const [strs, nums] = collect(mixed).partition((v): v is string => typeof v === 'string')
    expect(strs.all()).toEqual(['a', 'b'])
    expect(nums.all()).toEqual([1, 2])
  })
})

describe('compact', () => {
  it('drops null and undefined', () => {
    const items = [1, null, 2, undefined, 3] as Array<number | null | undefined>
    expect(collect(items).compact().all()).toEqual([1, 2, 3])
  })

  it('keeps falsy non-null values like 0 and ""', () => {
    const items = [0, '', false, null, undefined] as Array<unknown>
    expect(collect(items).compact().all()).toEqual([0, '', false])
  })

  it('returns empty for an all-null input', () => {
    expect(collect([null, undefined] as Array<number | null | undefined>).compact().all()).toEqual([])
  })
})

describe('whereInstanceOf narrows element type', () => {
  it('filters by class', () => {
    class Animal {
      constructor(public name: string) {}
    }
    class Plant {
      constructor(public name: string) {}
    }
    const items: (Animal | Plant)[] = [new Animal('cat'), new Plant('rose'), new Animal('dog')]
    // $ExpectType Collection<Animal>
    const animals = collect(items).whereInstanceOf(Animal)
    expect(animals.count()).toBe(2)
    expect(animals.first()?.name).toBe('cat')
  })
})
