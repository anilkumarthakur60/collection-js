import { collect } from '../collect'

describe('mapSpread', () => {
  it('should map arrays of numbers by adding the two elements', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result = collection.mapSpread((a: number, b: number) => a + b)
    expect(result.toArray()).toEqual([3, 7, 11])
  })

  it('should map arrays of strings by concatenating them', () => {
    const collection = collect([
      ['Hello', 'World'],
      ['Good', 'Morning'],
      ['Open', 'AI']
    ])
    const result = collection.mapSpread((a: string, b: string) => `${a} ${b}`)
    expect(result.toArray()).toEqual(['Hello World', 'Good Morning', 'Open AI'])
  })

  it('should map nested arrays with varying lengths', () => {
    const collection = collect([[1, 2, 3], [4, 5], [6]])
    const result = collection.mapSpread((a: number, b: number = 0, c: number = 0) => a + b + c)
    expect(result.toArray()).toEqual([6, 9, 6])
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    const result = collection.mapSpread((...args: number[]) =>
      args.reduce((sum, num) => sum + num, 0)
    )
    expect(result.toArray()).toEqual([])
  })

  it('should work with objects in nested arrays', () => {
    const collection = collect([
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }, { id: 4 }]
    ])
    const result = collection.mapSpread((a: { id: number }, b: { id: number }) => a.id + b.id)
    expect(result.toArray()).toEqual([3, 7])
  })

  it('should map tuples of mixed types', () => {
    const collection = collect([
      [1, 'a'],
      [2, 'b'],
      [3, 'c']
    ])
    const result = collection.mapSpread((...args: (number | string)[]) => {
      const [num, char] = args as [number, string]
      return `${char}${num}`
    })
    expect(result.toArray()).toEqual(['a1', 'b2', 'c3'])
  })

  it('should handle arrays with a single value', () => {
    const collection = collect([[1], [2], [3]])
    const result = collection.mapSpread((a: number, b: number = 0) => a + b)
    expect(result.toArray()).toEqual([1, 2, 3])
  })

  it('should return a collection of boolean results', () => {
    const collection = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const result = collection.mapSpread((a: number, b: number) => a < b)
    expect(result.toArray()).toEqual([true, true, true])
  })

  it('should not mutate the original collection', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const result = collection.mapSpread((a: number, b: number) => a + b)
    expect(collection.toArray()).toEqual([
      [1, 2],
      [3, 4]
    ]) // Original collection unchanged
    expect(result.toArray()).toEqual([3, 7])
  })

  it('should work with arrays of more than two elements', () => {
    const collection = collect([
      [1, 2, 3],
      [4, 5, 6]
    ])
    const result = collection.mapSpread((a: number, b: number, c: number) => a * b * c)
    expect(result.toArray()).toEqual([6, 120])
  })

  it('should handle callback returning a constant value', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const result = collection.mapSpread(() => 'constant')
    expect(result.toArray()).toEqual(['constant', 'constant'])
  })
})
