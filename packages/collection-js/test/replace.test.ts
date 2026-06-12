import { collect, operations } from '../src'

describe('replace (audit: replace/replaceShallow untested)', () => {
  it('replaces elements at the given indices without mutating the source', () => {
    const source = collect(['a', 'b', 'c'])
    const replaced = source.replace({ 1: 'B' })
    expect(replaced.all()).toEqual(['a', 'B', 'c'])
    expect(source.all()).toEqual(['a', 'b', 'c'])
  })

  it('supports multiple replacements at once', () => {
    expect(collect(['a', 'b', 'c']).replace({ 0: 'A', 2: 'C' }).all()).toEqual(['A', 'b', 'C'])
  })

  it('ignores negative and non-integer keys', () => {
    const replacements: Record<number, string> = { [-1]: 'neg', 1.5: 'frac' }
    expect(collect(['a', 'b']).replace(replacements).all()).toEqual(['a', 'b'])
  })

  it('an out-of-range index extends the array (documenting current behavior)', () => {
    const replaced = collect(['a']).replace({ 2: 'c' }).all()
    expect(replaced.length).toBe(3)
    expect(replaced[2]).toBe('c')
  })

  it('empty replacements return an equal copy', () => {
    expect(collect([1, 2]).replace({}).all()).toEqual([1, 2])
  })
})

describe('replaceRecursive (audit: replaceRecursiveOf untested)', () => {
  it('patches nested objects while keeping unpatched keys', () => {
    const source = collect([{ name: 'Alice', address: { city: 'Oslo', zip: '0150' } }])
    const patched = source.replaceRecursive([{ address: { city: 'Bergen' } }])
    expect(patched.all()).toEqual([{ name: 'Alice', address: { city: 'Bergen', zip: '0150' } }])
    // Source untouched (patching runs on a deep clone).
    expect(source.first()?.address.city).toBe('Oslo')
  })

  it('patches nested arrays positionally', () => {
    const patched = collect<unknown>([['a', 'b', 'c'], ['x']]).replaceRecursive([
      ['A', undefined, 'C']
    ])
    expect(patched.all()).toEqual([['A', 'b', 'C'], ['x']])
  })

  it('an undefined patch entry keeps the target value', () => {
    expect(collect(['a', 'b']).replaceRecursive([undefined, 'B']).all()).toEqual(['a', 'B'])
  })

  it('a longer patch appends its extra entries', () => {
    expect(collect(['a']).replaceRecursive(['A', 'b']).all()).toEqual(['A', 'b'])
  })

  it('scalar patch values overwrite object targets', () => {
    expect(
      collect<unknown>([{ a: 1 }])
        .replaceRecursive(['flat'])
        .all()
    ).toEqual(['flat'])
  })
})

describe('operations.replaceShallow edge cases', () => {
  it('ignores NaN-producing keys', () => {
    const replacements = { nope: 'x' } as unknown as Record<number, string>
    expect(operations.replaceShallow(['a'], replacements)).toEqual(['a'])
  })
})
